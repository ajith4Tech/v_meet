# Copyright (c) 2026, ajithbm01@gmail.com and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import get_datetime


class Bookings(Document):
	def validate(self):
		"""Validate booking data"""
		# Check if from_time is before to_time
		if self.from_time and self.to_time:
			if get_datetime(self.from_time) >= get_datetime(self.to_time):
				frappe.throw("From Time must be before To Time")
		
		# Check for conflicting bookings
		self.check_room_availability()
	
	def check_room_availability(self):
		"""Check if room is already booked for the given time"""
		existing_bookings = frappe.db.get_list(
			'Bookings',
			filters={
				'room': self.room,
				'status': ['!=', 'Cancelled'],
				'name': ['!=', self.name]  # Exclude current booking if editing
			},
			fields=['name', 'from_time', 'to_time']
		)
		
		self_from = get_datetime(self.from_time)
		self_to = get_datetime(self.to_time)
		
		for booking in existing_bookings:
			# Check for overlapping time slots
			booking_from = get_datetime(booking.from_time)
			booking_to = get_datetime(booking.to_time)
			if (self_from < booking_to and self_to > booking_from):
				frappe.throw(f"Room is already booked from {booking.from_time} to {booking.to_time}")


