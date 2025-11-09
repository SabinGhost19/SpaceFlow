"""
Avatar management routes.
Provides a list of animated avatars for users to choose from.
"""
from typing import List, Dict, Any
from fastapi import APIRouter, Query

router = APIRouter()

# Avatar collections using DiceBear API
AVATAR_STYLES = [
    "adventurer",
    "adventurer-neutral", 
    "avataaars",
    "avataaars-neutral",
    "big-ears",
    "big-ears-neutral",
    "big-smile",
    "bottts",
    "bottts-neutral",
    "croodles",
    "croodles-neutral",
    "fun-emoji",
    "icons",
    "identicon",
    "initials",
    "lorelei",
    "lorelei-neutral",
    "micah",
    "miniavs",
    "notionists",
    "notionists-neutral",
    "open-peeps",
    "personas",
    "pixel-art",
    "pixel-art-neutral",
    "rings",
    "shapes",
    "thumbs",
]

def generate_avatar_list(style: str, count: int = 50) -> List[Dict[str, str]]:
    """Generate a list of avatar URLs for a given style."""
    avatars = []
    for i in range(count):
        seed = f"{style}-{i}"
        avatar_url = f"https://api.dicebear.com/7.x/{style}/svg?seed={seed}"
        avatars.append({
            "id": f"{style}-{i}",
            "url": avatar_url,
            "style": style,
            "seed": seed
        })
    return avatars


@router.get("/styles", response_model=List[str])
async def get_avatar_styles() -> List[str]:
    """
    Get all available avatar styles.
    
    Returns:
        List of avatar style names
    """
    return AVATAR_STYLES


@router.get("/list", response_model=Dict[str, Any])
async def get_avatars(
    style: str = Query(default="avataaars", description="Avatar style to use"),
    page: int = Query(default=1, ge=1, description="Page number"),
    per_page: int = Query(default=20, ge=1, le=50, description="Items per page"),
) -> Dict[str, Any]:
    """
    Get paginated list of avatars for a specific style.
    
    Args:
        style: Avatar style (e.g., 'avataaars', 'bottts', 'personas')
        page: Page number (starting from 1)
        per_page: Number of avatars per page (max 50)
    
    Returns:
        Paginated list of avatar URLs with metadata
    """
    if style not in AVATAR_STYLES:
        style = "avataaars"  # Default fallback
    
    # Generate more avatars per style for variety
    total_avatars = 100
    all_avatars = generate_avatar_list(style, total_avatars)
    
    # Pagination
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    paginated_avatars = all_avatars[start_idx:end_idx]
    
    total_pages = (total_avatars + per_page - 1) // per_page
    
    return {
        "avatars": paginated_avatars,
        "pagination": {
            "current_page": page,
            "per_page": per_page,
            "total_items": total_avatars,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        },
        "style": style,
    }


@router.get("/generate", response_model=Dict[str, str])
async def generate_custom_avatar(
    style: str = Query(default="avataaars", description="Avatar style"),
    seed: str = Query(default="custom", description="Seed for avatar generation"),
) -> Dict[str, str]:
    """
    Generate a custom avatar with specific seed.
    
    Args:
        style: Avatar style
        seed: Seed for consistent avatar generation
    
    Returns:
        Avatar URL and metadata
    """
    if style not in AVATAR_STYLES:
        style = "avataaars"
    
    avatar_url = f"https://api.dicebear.com/7.x/{style}/svg?seed={seed}"
    
    return {
        "id": f"{style}-{seed}",
        "url": avatar_url,
        "style": style,
        "seed": seed
    }
