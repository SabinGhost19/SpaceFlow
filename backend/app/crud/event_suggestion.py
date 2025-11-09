"""
AI-powered event suggestion service using OpenAI.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Dict, Any, Optional
from datetime import date, time, datetime, timedelta
import json
from openai import AsyncOpenAI

from app.core.config import settings
from app.models.room import Room
from app.models.booking import Booking
from app.schemas.event_suggestion import (
    EventSuggestionRequest,
    ActivityRequest,
    EventSuggestionResponse,
    ActivitySuggestion,
    RoomSuggestion,
)
from app.crud.booking import check_room_availability


class EventSuggestionService:
    """Service for AI-powered room booking suggestions."""
    
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    
    async def get_available_rooms_for_slot(
        self,
        db: AsyncSession,
        booking_date: date,
        start_time: time,
        end_time: time,
    ) -> List[Room]:
        """
        Get all rooms available for a specific time slot.
        Only returns rooms that are:
        1. Marked as available (is_available = True)
        2. Not already booked for the requested time slot
        """
        # Get all rooms marked as available
        result = await db.execute(
            select(Room).where(Room.is_available == True)
        )
        all_rooms = result.scalars().all()
        
        # Filter by actual booking availability
        available_rooms = []
        for room in all_rooms:
            is_available = await check_room_availability(
                db=db,
                room_id=room.id,
                booking_date=booking_date,
                start_time=start_time,
                end_time=end_time,
            )
            if is_available:
                available_rooms.append(room)
        
        return available_rooms
    
    def _prepare_rooms_context(self, rooms: List[Room]) -> str:
        """Prepare room data for AI context."""
        rooms_info = []
        for room in rooms:
            room_info = {
                "id": room.id,
                "name": room.name,
                "description": room.description or "No description",
                "capacity": room.capacity,
                "amenities": room.amenities or [],
            }
            rooms_info.append(room_info)
        
        return json.dumps(rooms_info, indent=2)
    
    def _prepare_activity_context(self, activity: ActivityRequest) -> Dict[str, Any]:
        """Prepare activity data for AI context."""
        return {
            "name": activity.name,
            "start_time": activity.start_time.strftime("%H:%M"),
            "end_time": activity.end_time.strftime("%H:%M"),
            "participants_count": activity.participants_count,
            "required_amenities": activity.required_amenities or [],
            "preferences": activity.preferences or "None specified",
        }
    
    async def _parse_prompt_to_activities(
        self,
        prompt: str,
        booking_date: Optional[date] = None,
        general_preferences: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Use OpenAI to parse natural language prompt into structured activities."""
        
        system_prompt = """You are an intelligent event planning assistant. Your task is to parse natural language descriptions of events into structured activity data.

IMPORTANT RULES:
1. If no participant count is mentioned, assume 1 person (DEFAULT)
2. Extract date information if present
3. Extract time slots for each activity
4. Identify required amenities from the description
5. Each activity should be a separate booking

You must respond with valid JSON only, following this exact structure:
{
    "booking_date": "YYYY-MM-DD" or null if not specified,
    "activities": [
        {
            "name": "Activity name",
            "start_time": "HH:MM",
            "end_time": "HH:MM",
            "participants_count": 1,  // DEFAULT to 1 if not specified
            "required_amenities": ["amenity1", "amenity2"],
            "preferences": "any specific preferences"
        }
    ],
    "extracted_preferences": "general preferences extracted from prompt"
}"""

        user_prompt = f"""Parse the following event request into structured activities.

USER REQUEST:
{prompt}

CONTEXT:
- Default participants: 1 person (unless explicitly stated otherwise)
- Provided date: {booking_date.isoformat() if booking_date else "Not provided"}
- Additional preferences: {general_preferences or "None"}

Extract all activities with their time slots, participant counts (default to 1), and requirements.
If the user mentions "we", "team", or "group" without specifying a number, estimate a reasonable count.
If it's a single person activity (like "I need a room"), use 1 participant.

Respond with JSON only."""

        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.7,
                max_tokens=1000,
                response_format={"type": "json_object"},
            )
            
            ai_response = json.loads(response.choices[0].message.content)
            return ai_response
            
        except Exception as e:
            print(f"OpenAI API error while parsing prompt: {e}")
            raise ValueError(f"Failed to parse event request: {str(e)}")
    
    async def _get_ai_room_suggestion(
        self,
        activity: ActivityRequest,
        available_rooms: List[Room],
        general_preferences: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Use OpenAI to suggest the best room for an activity."""
        
        if not available_rooms:
            return {
                "suggested_room_id": None,
                "alternatives": [],
                "reasoning": "No rooms available for this time slot.",
                "confidence": 0.0,
            }
        
        rooms_context = self._prepare_rooms_context(available_rooms)
        activity_context = self._prepare_activity_context(activity)
        
        system_prompt = """You are an intelligent room booking assistant. Your task is to analyze activities and suggest the most appropriate meeting rooms based on:
1. Capacity requirements (room must fit all participants)
2. Required amenities/equipment
3. Activity type and characteristics
4. User preferences
5. Overall suitability

IMPORTANT: All rooms provided to you are ALREADY VERIFIED as available for the requested time slot. 
You only need to select the BEST room based on the activity requirements and characteristics.

DEFAULT: If participants count is 1, any room size is acceptable, but prefer smaller rooms for efficiency.

You must respond with valid JSON only, following this exact structure:
{
    "suggested_room_id": <number>,
    "confidence_score": <number between 0 and 1>,
    "reasoning": "<explanation why this room is best>",
    "alternative_room_ids": [<array of room IDs as alternatives>]
}"""

        user_prompt = f"""Given the following activity and available rooms, suggest the best room.

ACTIVITY DETAILS:
{json.dumps(activity_context, indent=2)}

GENERAL PREFERENCES: {general_preferences or "None"}

AVAILABLE ROOMS (All verified as available for the time slot):
{rooms_context}

Analyze and suggest the best room. Consider:
- Room capacity must be >= participants count (default is 1 person)
- Required amenities must be present
- Activity type matches room characteristics
- Overall room suitability
- For single person bookings, prefer smaller, efficient spaces

Note: All rooms listed are confirmed available for booking at the requested time.
Respond with JSON only."""

        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.7,
                max_tokens=500,
                response_format={"type": "json_object"},
            )
            
            ai_response = json.loads(response.choices[0].message.content)
            return ai_response
            
        except Exception as e:
            print(f"OpenAI API error: {e}")
            # Fallback to simple logic
            return self._fallback_room_selection(activity, available_rooms)
    
    def _fallback_room_selection(
        self,
        activity: ActivityRequest,
        available_rooms: List[Room],
    ) -> Dict[str, Any]:
        """Fallback logic if AI fails."""
        # Filter by capacity if specified (default to 1 if not specified)
        participants = activity.participants_count or 1
        suitable_rooms = [r for r in available_rooms if r.capacity >= participants]
        
        if not suitable_rooms:
            suitable_rooms = available_rooms
        
        # Filter by required amenities
        if activity.required_amenities:
            filtered = []
            for room in suitable_rooms:
                room_amenities = room.amenities or []
                if all(amenity in room_amenities for amenity in activity.required_amenities):
                    filtered.append(room)
            if filtered:
                suitable_rooms = filtered
        
        # Sort by capacity (closest match first)
        suitable_rooms.sort(key=lambda r: r.capacity)
        
        best_room = suitable_rooms[0] if suitable_rooms else available_rooms[0]
        alternatives = [r.id for r in suitable_rooms[1:4]]  # Top 3 alternatives
        
        return {
            "suggested_room_id": best_room.id,
            "confidence_score": 0.7,
            "reasoning": f"Selected based on capacity ({participants} participant(s)) and amenities match.",
            "alternative_room_ids": alternatives,
        }
    
    def _create_room_suggestion(
        self,
        room: Room,
        confidence: float,
        reasoning: str,
    ) -> RoomSuggestion:
        """Create a RoomSuggestion object."""
        return RoomSuggestion(
            room_id=room.id,
            room_name=room.name,
            capacity=room.capacity,
            amenities=room.amenities or [],
            confidence_score=confidence,
            reasoning=reasoning,
        )
    
    async def generate_suggestions(
        self,
        db: AsyncSession,
        request: EventSuggestionRequest,
    ) -> EventSuggestionResponse:
        """Generate AI-powered room suggestions from prompt or explicit activities."""
        
        suggestions = []
        warnings = []
        
        # Determine if we're in prompt mode or explicit mode
        if request.activities is None or len(request.activities) == 0:
            # PROMPT MODE: Parse the natural language prompt
            try:
                parsed_data = await self._parse_prompt_to_activities(
                    prompt=request.prompt,
                    booking_date=request.booking_date,
                    general_preferences=request.general_preferences,
                )
                
                # Extract booking date
                if not request.booking_date and parsed_data.get("booking_date"):
                    booking_date = datetime.fromisoformat(parsed_data["booking_date"]).date()
                elif request.booking_date:
                    booking_date = request.booking_date
                else:
                    raise ValueError("Could not determine booking date from prompt. Please specify a date.")
                
                # Extract activities
                activities_data = parsed_data.get("activities", [])
                if not activities_data:
                    raise ValueError("Could not extract any activities from your request. Please be more specific.")
                
                # Convert to ActivityRequest objects
                activities = []
                for act_data in activities_data:
                    try:
                        activity = ActivityRequest(
                            name=act_data["name"],
                            start_time=datetime.strptime(act_data["start_time"], "%H:%M").time(),
                            end_time=datetime.strptime(act_data["end_time"], "%H:%M").time(),
                            participants_count=act_data.get("participants_count", 1),  # DEFAULT to 1
                            required_amenities=act_data.get("required_amenities", []),
                            preferences=act_data.get("preferences"),
                        )
                        activities.append(activity)
                    except Exception as e:
                        warnings.append(f"Skipped invalid activity: {str(e)}")
                        continue
                
                # Use extracted preferences if not provided
                if not request.general_preferences and parsed_data.get("extracted_preferences"):
                    general_preferences = parsed_data["extracted_preferences"]
                else:
                    general_preferences = request.general_preferences
                    
            except Exception as e:
                raise ValueError(f"Failed to understand your request: {str(e)}")
        else:
            # EXPLICIT MODE: Use provided activities directly
            activities = request.activities
            booking_date = request.booking_date
            general_preferences = request.general_preferences
            
            if not booking_date:
                raise ValueError("Booking date is required when providing explicit activities.")
        
        # Process each activity
        for activity in activities:
            # Get available rooms for this time slot
            available_rooms = await self.get_available_rooms_for_slot(
                db=db,
                booking_date=booking_date,
                start_time=activity.start_time,
                end_time=activity.end_time,
            )
            
            if not available_rooms:
                warnings.append(
                    f"No available rooms for '{activity.name}' on {booking_date} "
                    f"between {activity.start_time.strftime('%H:%M')}-{activity.end_time.strftime('%H:%M')}. "
                    f"All rooms are either booked or unavailable for this time slot."
                )
                continue
            
            # Get AI suggestion
            ai_result = await self._get_ai_room_suggestion(
                activity=activity,
                available_rooms=available_rooms,
                general_preferences=general_preferences,
            )
            
            if not ai_result.get("suggested_room_id"):
                warnings.append(f"Could not find suitable room for '{activity.name}'")
                continue
            
            # Create room suggestion objects
            suggested_room_obj = next(
                (r for r in available_rooms if r.id == ai_result["suggested_room_id"]),
                None
            )
            
            if not suggested_room_obj:
                continue
            
            suggested_room = self._create_room_suggestion(
                room=suggested_room_obj,
                confidence=ai_result.get("confidence_score", 0.8),
                reasoning=ai_result.get("reasoning", "Suggested by AI"),
            )
            
            # Get alternatives
            alternative_rooms = []
            for alt_id in ai_result.get("alternative_room_ids", [])[:3]:
                alt_room = next((r for r in available_rooms if r.id == alt_id), None)
                if alt_room:
                    alternative_rooms.append(
                        self._create_room_suggestion(
                            room=alt_room,
                            confidence=ai_result.get("confidence_score", 0.7) - 0.1,
                            reasoning="Alternative option",
                        )
                    )
            
            # Create activity suggestion
            activity_suggestion = ActivitySuggestion(
                activity_name=activity.name,
                start_time=activity.start_time,
                end_time=activity.end_time,
                suggested_room=suggested_room,
                alternative_rooms=alternative_rooms,
                participants_count=activity.participants_count or 1,  # Show default
            )
            
            suggestions.append(activity_suggestion)
        
        overall_notes = None
        if warnings:
            overall_notes = " | ".join(warnings)
        
        return EventSuggestionResponse(
            booking_date=booking_date,
            suggestions=suggestions,
            overall_notes=overall_notes,
        )


# Singleton instance
event_suggestion_service = EventSuggestionService()
