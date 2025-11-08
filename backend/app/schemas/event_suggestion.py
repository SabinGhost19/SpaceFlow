"""
Event Suggestion Pydantic schemas for AI-powered room booking suggestions.
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, time


class ActivityRequest(BaseModel):
    """Schema for a single activity requested by user."""
    name: str = Field(..., description="Name/description of the activity")
    start_time: time = Field(..., description="Start time for the activity")
    end_time: time = Field(..., description="End time for the activity")
    participants_count: Optional[int] = Field(None, gt=0, description="Expected number of participants")
    required_amenities: Optional[List[str]] = Field(default=[], description="Required amenities/equipment for this activity")
    preferences: Optional[str] = Field(None, description="Additional preferences or requirements")


class EventSuggestionRequest(BaseModel):
    """Schema for requesting AI-powered event suggestions."""
    booking_date: date = Field(..., description="Date for the activities")
    activities: List[ActivityRequest] = Field(..., min_length=1, description="List of activities to schedule")
    general_preferences: Optional[str] = Field(None, description="General preferences for all activities")


class RoomSuggestion(BaseModel):
    """Schema for a suggested room for an activity."""
    room_id: int
    room_name: str
    capacity: int
    amenities: List[str]
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="AI confidence in this suggestion (0-1)")
    reasoning: str = Field(..., description="Explanation why this room was suggested")


class ActivitySuggestion(BaseModel):
    """Schema for a suggested booking for one activity."""
    activity_name: str
    start_time: time
    end_time: time
    suggested_room: RoomSuggestion
    alternative_rooms: List[RoomSuggestion] = Field(default=[], description="Alternative room options")
    participants_count: Optional[int] = None


class EventSuggestionResponse(BaseModel):
    """Schema for AI-powered event suggestions response."""
    booking_date: date
    suggestions: List[ActivitySuggestion]
    overall_notes: Optional[str] = Field(None, description="General notes or warnings from AI")


class BookingConfirmation(BaseModel):
    """Schema for confirming a single booking from suggestions."""
    room_id: int
    activity_name: str
    start_time: time
    end_time: time
    participant_ids: Optional[List[int]] = Field(default=[], description="List of participant user IDs")


class BulkBookingConfirmation(BaseModel):
    """Schema for confirming multiple bookings at once."""
    booking_date: date
    bookings: List[BookingConfirmation] = Field(..., min_length=1)


class BulkBookingResponse(BaseModel):
    """Schema for response after creating multiple bookings."""
    created_bookings: List[int] = Field(..., description="List of created booking IDs")
    failed_bookings: List[dict] = Field(default=[], description="List of failed bookings with error messages")
    success_count: int
    failure_count: int
