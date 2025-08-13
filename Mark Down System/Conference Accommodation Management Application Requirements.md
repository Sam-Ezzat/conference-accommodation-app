# Conference Accommodation Management Application Requirements

This application aims to simplify the process of accommodating attendees in hotels or large houses, focusing on solving the problems faced by organizers of large events.

## 1. Accommodation Management (Hotels/Houses)
- **Registering Hotel/House Information:** Ability to add new hotels or houses with detailed information (name, address, contact information).
- **Building and Room Management:**
    - Registering names/numbers of buildings within each hotel/house.
    - Registering available room numbers within each building.
    - Specifying the capacity of each room (number of individuals).
    - Specifying the room type (men, women, families).
    - Specifying additional room characteristics (e.g., ground floor/first floor for elderly).
    - Updating room status (available, booked, full).

## 2. Attendee Registration Management
- **Registration Forms:**
    - Creating customizable registration forms to collect attendee data.
    - Collecting basic attendee information (name, age, gender, church, region).
    - Collecting accommodation preferences (who they wish to stay with, any special requirements).
    - Ability to specify if the conference requires a room leader (for youth/children conferences).
- **Data Filtering and Export:**
    - Ability to filter attendee data after registration closes based on various criteria (age, gender, church, region).
    - Exporting data in different formats (e.g., Excel).

## 3. Smart Accommodation System
- **Automated Room Assignment:**
    - A system for assigning attendees to rooms based on the following criteria:
        - **Gender:** Complete separation of men and women in separate rooms.
        - **Age:** Considering age during assignment (especially for elderly on ground/first floors).
        - **Preferences:** Attempting to fulfill requests to stay with specific individuals.
        - **Families:** Allocating family rooms for husband, wife, and children together.
        - **Leaders/Supervisors:** Assigning a leader/supervisor to each room in conferences that require it.
        - **Capacity:** Not exceeding room capacity.
- **Manual Adjustment:** Ability to manually adjust assignments after automated distribution.

## 4. Communication and Notification System
- **Sending Accommodation Details:**
    - Sending accommodation details to each attendee (building name/number, room number) via:
        - WhatsApp messages (WhatsApp API integration if possible).
        - Personal email.
- **General Notifications:** Ability to send general notifications to attendees.

## 5. Transportation Management (Buses)
- **Registering Gathering Areas:** Ability to register different gathering areas.
- **Specifying Buses:**
    - Specifying the number of buses required for each area.
    - Specifying bus sizes (capacity).
    - Linking attendees to buses based on their areas.

## 6. Reports and Dashboards
- **Organizer Dashboard:** Comprehensive overview of accommodation status, available rooms, registered attendees.
- **Detailed Reports:** Reports on accommodation, buses, attendance.

## 7. General Requirements
- **User-Friendly Interface:** Intuitive and organized design for organizers and attendees.
- **Security:** Protecting attendee data and ensuring privacy.
- **Flexibility:** Ability to adapt to different types of conferences and events.
- **Scalability:** Ability to handle large numbers of attendees and rooms.

