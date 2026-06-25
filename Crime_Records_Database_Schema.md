# Page 1

Crime Records of India Database Schema Documentation Enterprise Database
Architecture & Table Documentation

------------------------------------------------------------------------

# Page 2

1.  Database Overview The Crime Records of India platform uses MySQL as
    the primary relational database. The architecture is divided into
    Authentication Tables, Governance Tables, Analytics Tables, and
    Dynamic Dataset Tables.
2.  Database Architecture Layers Layer Purpose Authentication Layer
    Stores users, admins, refresh tokens Analytics Layer Tracks
    searches, views, activity logs Governance Layer Tracks admin
    modifications and deletions Dataset Layer Stores crime datasets
    dynamically
3.  Authentication Tables 3.1 users Table Column Type Description id INT
    Primary key username VARCHAR Unique username email VARCHAR User
    email password_hash TEXT Encrypted password full_name VARCHAR User
    full name last_login DATETIME Last login timestamp created_at
    TIMESTAMP Account creation time 3.2 admins Table Column Type
    Description id INT Primary key username VARCHAR Admin username email
    VARCHAR Admin email password_hash TEXT Encrypted password role
    VARCHAR Admin role status VARCHAR Account status last_login DATETIME
    Last login timestamp created_at TIMESTAMP Creation time 3.3
    refresh_tokens Table Column Type Description id INT Primary key
    user_type VARCHAR user/admin

------------------------------------------------------------------------

# Page 3

user_id INT Owner ID token TEXT JWT refresh token expires_at DATETIME
Expiration timestamp created_at TIMESTAMP Creation time

------------------------------------------------------------------------

# Page 4

4.  Analytics Tables 4.1 views_log Table Column Purpose user_id Tracks
    viewer username Viewer username table_viewed Dataset viewed user_ip
    Viewer IP created_at View timestamp 4.2 search_logs Table Column
    Purpose user_id Tracks searching user table_name Dataset searched
    search_filters Applied filters result_count Returned records user_ip
    Requester IP created_at Search timestamp
5.  Governance Tables Governance tables track administrative actions for
    transparency, accountability, and auditability. 5.1
    admin_modification_logs Column Purpose admin_id Admin identifier
    admin_username Admin username table_name Affected dataset table
    action_type UPDATE / DELETE old_data Previous dataset values
    new_data Updated values changed_columns Modified columns ip_address
    Admin IP address created_at Action timestamp

------------------------------------------------------------------------

# Page 5

6.  Dynamic Dataset Tables The platform dynamically exposes crime
    datasets through metadata-driven APIs. Each dataset table can be
    queried using dynamic routes. Dataset Table auto_theft
    victims_of_rape serious_fraud police_housing
    property_stolen_and_recovered human_rights_violation_by_police
    specific_purpose_of_kidnapping_and_abduction
    trial_of_violent_crimes_by_courts
7.  Redis Cache Layer Redis is used as an in-memory cache layer to
    improve performance for metadata APIs and analytics endpoints. Cache
    Key Purpose TTL all_tables Caches dataset table list 30 Minutes
    schema\_{table} Caches dataset schema 1 Hour analytics_overview
    Caches analytics dashboard 5 Minutes
8.  Database Relationships  users.id → refresh_tokens.user_id  admins.id
    → refresh_tokens.user_id  users.id → views_log.user_id  users.id →
    search_logs.user_id  admins.id → admin_modification_logs.admin_id
    Crime Records of India - Database Schema Documentation
