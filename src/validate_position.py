def validate_position_decorator(func):
    """Decorator that validates position is non-negative before calling function."""
    def wrapper(position, *args, **kwargs):
        if position < 0:
            raise ValueError("Position must be non-negative")

        return func(position, *args, **kwargs)

    return wrapper
