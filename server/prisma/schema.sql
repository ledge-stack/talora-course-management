-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Role Enum Type
CREATE TYPE user_role AS ENUM ('student', 'group_leader', 'class_rep');

-- Application Status Enum Type
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');

-- Complaint Status Enum Type
CREATE TYPE complaint_status AS ENUM ('open', 'in_review', 'resolved');

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role user_role DEFAULT 'student',
    is_retake BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Constraint: Hard cap of at most 2 users with the class_rep role
CREATE OR REPLACE FUNCTION check_class_rep_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM users WHERE role = 'class_rep') >= 2 AND NEW.role = 'class_rep' THEN
        RAISE EXCEPTION 'Maximum limit of 2 Class Representatives reached.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_limit_class_rep
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
WHEN (NEW.role = 'class_rep')
EXECUTE FUNCTION check_class_rep_limit();

-- Course Units Table
CREATE TABLE course_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    min_group_size INT DEFAULT 1,
    max_group_size INT NOT NULL,
    submission_deadline TIMESTAMPTZ,
    allows_swaps BOOLEAN DEFAULT TRUE
);

-- Groups Table
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_unit_id UUID REFERENCES course_units(id) ON DELETE CASCADE,
    group_number INT NOT NULL,
    leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
    whatsapp_link TEXT,
    UNIQUE(course_unit_id, group_number)
);

-- Default Group Templates Table
CREATE TABLE default_group_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    leader_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    template_name VARCHAR(255) DEFAULT 'My Default Team'
);

-- Default Template Members Table
CREATE TABLE default_template_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES default_group_templates(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(template_id, user_id)
);

-- Group Memberships Table
CREATE TABLE group_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_retake BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- Group Applications Table
CREATE TABLE group_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status application_status DEFAULT 'pending',
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    UNIQUE(group_id, applicant_id)
);

-- Submissions Table
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    version INT DEFAULT 1,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Complaints Table
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submitted_by UUID REFERENCES users(id) ON DELETE CASCADE,
    course_unit_id UUID REFERENCES course_units(id) ON DELETE SET NULL,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status complaint_status DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timetable Table
CREATE TABLE timetable (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_unit_id UUID REFERENCES course_units(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    venue VARCHAR(255) NOT NULL,
    lecturer_name VARCHAR(255) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_groups_course ON groups(course_unit_id);
CREATE INDEX idx_memberships_user ON group_memberships(user_id);
CREATE INDEX idx_applications_group ON group_applications(group_id);
CREATE INDEX idx_applications_status ON group_applications(status);
CREATE INDEX idx_submissions_group ON submissions(group_id);
CREATE INDEX idx_complaints_user ON complaints(submitted_by);
CREATE INDEX idx_timetable_course ON timetable(course_unit_id);
