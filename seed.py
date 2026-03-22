"""
Database Seeding Utility.
Populates the database with realistic dummy data (Tenants, Users, Issues, Logs) 
to facilitate local development and QA testing.
"""
from app.db.session import SessionLocal
from app.models.auth import UserAuth
from app.models.company import Company
from app.models.issues import Issue
from app.models.user import User
from app.models.logs import IssueLog
from app.utils import hash_password 

db = SessionLocal()

def seed_data():
    print("🌱 Initiating database seeding...")

    # ---------------------------------------------------------
    # 1. COMPANIES (Tenants)
    # ---------------------------------------------------------
    system_company = Company(name="SyncNode System", subscription_plan="enterprise")
    company_a = Company(name="TechFlow Inc", subscription_plan="pro")
    company_b = Company(name="SoftSolutions", subscription_plan="free")
    company_c = Company(name="Innovate Ltd", subscription_plan="enterprise")

    db.add_all([system_company, company_a, company_b, company_c])
    db.commit() 
    
    db.refresh(system_company)
    db.refresh(company_a)
    db.refresh(company_b)

    print(f"✅ Created 4 Companies (including System HQ)")

    # ---------------------------------------------------------
    # 2. USERS & AUTHENTICATION 
    # ---------------------------------------------------------
    
    # --- SUPERADMIN ---
    superadmin = User(
        company_id=system_company.id,
        first_name="System",
        last_name="Administrator",
        email="superadmin@syncnode.com",
        role="superadmin",
        avatar_url="https://ui-avatars.com/api/?name=System+Admin&background=000000&color=fff"
    )

    # --- Users for TechFlow (Company A) ---
    user_1 = User(
        company_id=company_a.id,
        first_name="Alex",
        last_name="Mitchell",
        email="alex@techflow.com",
        role="admin",
        avatar_url="https://ui-avatars.com/api/?name=Alex+Mitchell&background=0D8ABC&color=fff"
    )
    user_2 = User(
        company_id=company_a.id,
        first_name="Sarah",
        last_name="Jenkins",
        email="sarah@techflow.com",
        role="developer",
        avatar_url="https://ui-avatars.com/api/?name=Sarah+Jenkins&background=10B981&color=fff"
    )
    user_5 = User(
        company_id=company_a.id,
        first_name="David",
        last_name="Kim",
        email="david@techflow.com",
        role="IT",
        avatar_url="https://ui-avatars.com/api/?name=David+Kim&background=64748B&color=fff"
    )

    # --- Users for SoftSolutions (Company B) ---
    user_3 = User(
        company_id=company_b.id,
        first_name="Michael",
        last_name="Chang",
        email="mike@softsolutions.com",
        role="owner",
        avatar_url="https://ui-avatars.com/api/?name=Michael+Chang&background=F59E0B&color=fff"
    )
    user_4 = User(
        company_id=company_b.id,
        first_name="Emma",
        last_name="Rodriguez",
        email="emma@softsolutions.com",
        role="developer",
        avatar_url="https://ui-avatars.com/api/?name=Emma+Rodriguez&background=8B5CF6&color=fff"
    )
    user_6 = User(
        company_id=company_b.id,
        first_name="Rachel",
        last_name="Green",
        email="rachel@softsolutions.com",
        role="IT",
        avatar_url="https://ui-avatars.com/api/?name=Rachel+Green&background=0ea5e9&color=fff"
    )

    db.add_all([superadmin, user_1, user_2, user_3, user_4, user_5, user_6])
    db.commit()

    # Generate secure auth profiles for all users
    default_password = hash_password("password123")
    auth_profiles = [
        UserAuth(user_id=u.id, password_hash=default_password) 
        for u in [superadmin, user_1, user_2, user_3, user_4, user_5, user_6]
    ]
    
    db.add_all(auth_profiles)
    db.commit()
    print("✅ Created 7 Users with realistic profiles and avatars.")

    # ---------------------------------------------------------
    # 3. ISSUES
    # ---------------------------------------------------------
    
    # Issues for TechFlow
    issue_1 = Issue(
        title="Server Crash on Login",
        description="The production server crashes randomly when an admin attempts to log in via SSO.",
        priority="high",
        status="open",
        type="bug",
        company_id=company_a.id,
        creator_id=user_1.id,
        assignee_id=user_2.id,
        git_url="https://github.com/techflow/core-backend/issues/42"
    )
    issue_2 = Issue(
        title="Implement Stripe Webhooks",
        description="We need to listen for Stripe payment succeeded events to upgrade user tiers.",
        priority="medium",
        status="in_progress",
        type="task",
        company_id=company_a.id,
        creator_id=user_1.id,
        assignee_id=None, # Left unassigned so you can show off the Claim button!
        git_url="https://github.com/techflow/core-backend/pull/18" 
    )

    # Issues for SoftSolutions
    issue_3 = Issue(
        title="Fix Navbar Mobile Layout",
        description="The hamburger menu is overflowing on screens smaller than 320px.",
        priority="low",
        status="done",
        type="bug",
        company_id=company_b.id,
        creator_id=user_3.id,
        assignee_id=user_4.id,
        git_url="https://github.com/softsolutions/frontend/issues/7" 
    )

    db.add_all([issue_1, issue_2, issue_3])
    db.commit()
    
    db.refresh(issue_1)
    db.refresh(issue_2)
    db.refresh(issue_3)
    print("✅ Created 3 Dummy Issues.")

    # ---------------------------------------------------------
    # 4. AUDIT LOGS (Activity Feed)
    # ---------------------------------------------------------
    
    log_1 = IssueLog(
        company_id=company_a.id, 
        issue_id=issue_1.id,
        actor_id=user_1.id,
        action="created_issue",
        old_value=None,
        new_value="open"
    )
    log_2 = IssueLog(
        company_id=company_a.id, 
        issue_id=issue_2.id,
        actor_id=user_2.id,
        action="changed_status",
        old_value="open",
        new_value="in_progress"
    )
    log_3 = IssueLog(
        company_id=company_b.id, 
        issue_id=issue_3.id,
        actor_id=user_4.id,
        action="changed_status",
        old_value="in_progress",
        new_value="done"
    )
    
    db.add_all([log_1, log_2, log_3])
    db.commit()
    print("✅ Populated Activity Feed with historical logs.")
    print("🚀 Seeding Complete! You can now log in.")

if __name__ == "__main__":
    seed_data()