import frappe


@frappe.whitelist()
def update_booking_status(booking_name, status):
    """
    Update the status of a booking.
    Only users with the 'Administrator' or 'System Manager' role are allowed.
    """
    # Server-side admin check — cannot be bypassed from the frontend
    user = frappe.session.user
    user_roles = frappe.get_roles(user)

    if "Administrator" not in user_roles and "System Manager" not in user_roles:
        frappe.throw(
            "You do not have permission to change booking status.",
            frappe.PermissionError
        )

    allowed_statuses = ["Pending", "Approved", "Occupied", "Free To Use"]
    if status not in allowed_statuses:
        frappe.throw(f"Invalid status value: {status}")

    doc = frappe.get_doc("Bookings", booking_name)
    doc.status = status
    doc.save(ignore_permissions=True)
    frappe.db.commit()

    return {"name": doc.name, "status": doc.status}


@frappe.whitelist()
def get_current_user_info():
    """
    Returns the current session user's name and whether they are an admin.
    Used by the frontend to gate admin-only UI.
    """
    user = frappe.session.user
    user_roles = frappe.get_roles(user)
    is_admin = "Administrator" in user_roles or "System Manager" in user_roles

    return {
        "user": user,
        "is_admin": is_admin,
    }
