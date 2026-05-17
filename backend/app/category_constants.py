PREDEFINED_CATEGORIES = [
    "Electronics",
    "Wallet",
    "Keys",
    "ID Card",
    "Books",
    "Bags",
    "Clothing",
    "Accessories",
    "Water Bottle",
    "Stationery",
    "Documents",
    "Mobile Phone",
    "Laptop",
    "Earphones",
    "Watch",
    "Jewelry",
    "Sports Equipment",
    "Others",
]

DEFAULT_CATEGORY = "Others"
_CATEGORY_LOOKUP = {category.lower(): category for category in PREDEFINED_CATEGORIES}


def normalize_category(category: str | None) -> str:
    if not category:
        return DEFAULT_CATEGORY

    normalized = category.strip()
    if not normalized:
        return DEFAULT_CATEGORY

    return _CATEGORY_LOOKUP.get(normalized.lower(), DEFAULT_CATEGORY)


def validate_category_input(category: str | None) -> str:
    if not category:
        raise ValueError("Invalid category")

    normalized = category.strip()
    if not normalized:
        raise ValueError("Invalid category")

    matched = _CATEGORY_LOOKUP.get(normalized.lower())
    if matched is None:
        raise ValueError("Invalid category")
    return matched


def is_valid_category(category: str | None) -> bool:
    try:
        return validate_category_input(category) in PREDEFINED_CATEGORIES
    except ValueError:
        return False
