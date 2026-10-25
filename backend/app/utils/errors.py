from fastapi import HTTPException, status

class TravelWiseException(HTTPException):
    def __init__(self, detail: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        super().__init__(status_code=status_code, detail=detail)

class ItineraryGenerationError(TravelWiseException):
    def __init__(self, detail: str = "Failed to generate travel itinerary."):
        super().__init__(detail=detail, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TripNotFoundError(TravelWiseException):
    def __init__(self, trip_id: str):
        super().__init__(detail=f"Trip '{trip_id}' was not found.", status_code=status.HTTP_404_NOT_FOUND)
