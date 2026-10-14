export type UserRole = 'STUDENT' | 'FACULTY' | 'ADMIN';

export type ResourceStatus = 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE' | 'IN_USE';

export type BookingStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'CHANGES_REQUESTED'
  | 'COMPLETED'
  | 'NO_SHOW'
  | 'CHECKED_IN';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IssueStatus = 'OPEN' | 'IN_REPAIR' | 'SCHEDULED' | 'RESOLVED';

export type OpportunityType = 'HACKATHON' | 'INTERNSHIP' | 'CERTIFICATION' | 'COMPETITION' | 'WORKSHOP' | 'SCHOLARSHIP' | 'RESEARCH';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  rollNumber?: string;
  department: string;
  title?: string;
  academicYear?: number;     // e.g. 3 for 3rd Year
  teachingYear?: number;     // e.g. 3 for 3rd Year
  academicYearLabel?: string; // "3rd Year"
}

export interface ResourceFeature {
  id: string;
  feature: string;
}

export interface ResourceBookingRules {
  maxDurationHours?: number;
  advanceNoticeHours?: number;
  cancellationDeadlineHours?: number;
  gracePeriodMinutes?: number;
  approvalRequired?: boolean;
}

export interface Resource {
  id: string;
  resourceCode?: string;
  name: string;
  type: 'Lab' | 'Room' | 'Equipment' | 'Facility' | 'Bundle';
  building: string;
  floor: string;
  roomNumber?: string;
  campusZone?: string;
  capacity: number;
  minCapacity?: number;
  status: ResourceStatus;
  department: string;
  manager?: string;
  imageUrl: string;
  features: string[];
  requiredDependencies?: string[]; // e.g. ["Projector #04", "Arduino Kits"]
  isShared?: boolean;
  sharedWith?: string[];
  operatingHours?: string;
  description?: string;
  bookingRules?: ResourceBookingRules;
  allowedRoles?: UserRole[];
  maintenanceFrequencyDays?: number;
  nextMaintenanceDate?: string;
  bundleItemIds?: string[];
}

export interface Booking {
  id: string;
  bookingCode: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  resourceId: string;
  resourceName: string;
  resourceType: string;
  location: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  purpose: 'Class' | 'Project' | 'Research' | 'Hackathon' | 'Other';
  status: BookingStatus;
  requestedAt: string;
  additionalItems?: string[];
  qrCodeUrl?: string;
  checkedInAt?: string;
  rejectionReason?: string;
  requestChangesNote?: string;
  approvalStep?: 'Faculty' | 'Admin' | 'Approved';
  bundleResourceIds?: string[];
}

export type LeaveType =
  | 'AFTERNOON_EXIT'
  | 'EMERGENCY_LEAVE'
  | 'MEDICAL_LEAVE'
  | 'DAY_OUTPASS'
  | 'HOME_VISIT'
  | 'EVENT_OD';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' | 'CHECKED_OUT';

export interface LeavePermission {
  id: string;
  passCode: string;            // e.g. "OUT-8941"
  userId: string;
  userName: string;
  rollNumber: string;
  department: string;
  academicYear: number;
  academicYearLabel: string;   // e.g. "3rd Year"
  studentPhone?: string;
  parentPhone: string;
  parentName?: string;
  
  leaveType: LeaveType;
  leaveTypeLabel: string;      // e.g. "Afternoon Exit (Going Home)"
  reason: string;
  destination: string;         // e.g. "Home, Madhapur, Hyderabad"
  
  date: string;                // Date of exit (e.g. "2026-10-14")
  departureTime: string;       // e.g. "01:30 PM"
  expectedReturnTime?: string; // e.g. "Next Day 08:30 AM" or "Not Returning (Going Home)"
  isFullDayOrAfternoon: 'AFTERNOON' | 'EARLY_EXIT' | 'FULL_DAY';
  
  status: LeaveStatus;
  requestedAt: string;         // Timestamp
  
  // Faculty Approval Details
  approvedByFacultyId?: string;
  approvedByFacultyName?: string;
  approvedAt?: string;
  approvalRemarks?: string;
  
  // Rejection / Change request details
  rejectionReason?: string;
  requestChangesNote?: string;
  
  // Security QR Pass Details
  qrPassCode?: string;         // e.g. "PASS-RESORA-OUT-8941-SEC"
  qrIssuedAt?: string;
  validGate?: string;          // e.g. "Main Gate & Block C Gate"
  checkedOutAt?: string;       // When security guard scans the QR
  securityGuardNotes?: string;
}

export interface ApplyForLeaveInput {
  leaveType: LeaveType;
  leaveTypeLabel: string;
  reason: string;
  destination: string;
  date: string;
  departureTime: string;
  expectedReturnTime?: string;
  isFullDayOrAfternoon: 'AFTERNOON' | 'EARLY_EXIT' | 'FULL_DAY';
  parentPhone: string;
  parentName?: string;
  studentPhone?: string;
}

export interface WaitlistEntry {
  id: string;
  resourceId: string;
  resourceName: string;
  userId: string;
  userName: string;
  requestedDate: string;
  requestedStartTime: string;
  requestedEndTime: string;
  position: number;
  createdAt: string;
}

export interface MaintenanceIssue {
  id: string;
  resourceId: string;
  resourceName: string;
  resourceType: string;
  reportedBy: string;
  issueDescription: string;
  priority: Priority;
  status: IssueStatus;
  reportedDate: string;
  scheduledDate?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  resource: string;
  status: string;
  details?: string;
}

export type OpportunityRegistrationStatus = 'OPEN' | 'CLOSING_SOON' | 'CLOSED' | 'UPCOMING' | 'DRAFT';

export interface OpportunityTimelinePhase {
  phase: string;
  date: string;
  description: string;
}

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  organizer?: string;
  logoUrl?: string;
  type: OpportunityType;
  category?: string;
  
  // Descriptions
  shortDescription?: string;
  description: string;
  fullDescription?: string;
  
  // Mode & Location
  mode?: string;
  workMode?: string;
  location?: string;
  
  // Dates & Deadlines
  startDate?: string;
  endDate?: string;
  registrationStartDate?: string;
  registrationDeadline?: string;
  applicationDeadline?: string;
  deadline: string;
  submissionDeadline?: string;
  presentationDate?: string;
  resultsDate?: string;
  
  // Hackathon Specific
  teamMinSize?: number;
  teamMaxSize?: number;
  teamSize?: string;
  themes?: string[];
  problemStatements?: string[];
  tracks?: string[];
  prizePool?: string;
  stipendOrPrize?: string;
  judgingCriteria?: string[];
  timeline?: OpportunityTimelinePhase[];
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  sponsors?: string[];
  mentors?: string[];
  numberOfRounds?: number;
  
  // Internship Specific
  role?: string;
  domain?: string;
  domains?: string[];
  duration?: string;
  stipend?: string;
  currency?: string;
  employmentType?: string;
  experienceRequired?: string;
  selectionProcess?: string[];
  responsibilities?: string[];
  learningOutcomes?: string[];
  certificateAvailable?: boolean;
  certificates?: boolean;
  weeklyHours?: string;
  vacancies?: number;
  mentorProvided?: boolean;
  conversionOpportunity?: boolean;
  applicationInstructions?: string;
  
  // Certification Specific
  certificationProvider?: string;     // e.g., 'AWS', 'Google Cloud', 'Microsoft', 'Meta', 'Cisco', 'CNCF', 'DeepLearning.AI', 'Harvard'
  certificationLevel?: 'Foundational' | 'Associate' | 'Professional' | 'Specialty' | string;
  examCode?: string;                  // e.g., 'SAA-C03', 'AZ-104', 'CKA', 'AI-102'
  examDurationMinutes?: number;       // e.g., 130
  passingScore?: string;              // e.g., '720 / 1000' or '70%'
  examFormat?: string;                // e.g., '65 Multiple Choice & Multi-select Questions'
  voucherDiscount?: string;           // e.g., '100% Free Campus Voucher' or '50% Student Discount'
  voucherCode?: string;               // e.g., 'RESORA-AWS-EDU26'
  examFee?: string;                   // e.g., '$150 (Free for Resora Students)'
  credentialValidity?: string;        // e.g., '3 Years' or 'Lifetime'
  badgeUrl?: string;                  // Digital badge image url
  curriculumSyllabusUrl?: string;     // Official Exam Guide PDF
  prerequisites?: string[];           // Pre-requisite knowledge
  preparationHours?: string;          // e.g., '40 - 60 Hours'
  academicCreditEquivalency?: string; // e.g., '3 Open Elective Credits (Sem 7/8)'
  
  // Certification Course Specific
  isCourseSeries?: boolean;
  instructorName?: string;             // e.g., 'Prof. Andrew Ng', 'Prof. David J. Malan'
  instructorTitle?: string;            // e.g., 'Founder DeepLearning.AI, Adjunct Prof Stanford'
  learningPlatform?: string;           // e.g., 'Coursera Campus', 'edX', 'Harvard Online', 'NPTEL'
  totalCoursesCount?: number;          // e.g., 5 Courses in Specialization
  courseModules?: {
    moduleNumber: number;
    title: string;
    duration: string;
    topics: string[];
    skillsGained?: string[];
    isCapstone?: boolean;
  }[];
  capstoneProject?: string;            // Capstone project details
  enrolledStudentsCount?: number;      // e.g., 280 Resora Students
  hasFinancialAidOrLicense?: boolean;
  
  // Requirements & Skills
  eligibility?: string;
  eligibleDegrees?: string[];
  eligibleYears?: string[];
  eligibleDepartments?: string[];
  skillsRequired?: string[];
  preferredSkills?: string[];
  technologies?: string[];
  
  // URL Safety & Verification (Critical)
  officialWebsiteUrl?: string;
  applicationUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  source?: string;
  isVerified?: boolean;
  isFeatured?: boolean;
  registrationStatus?: OpportunityRegistrationStatus;
  
  // State
  saved?: boolean;
  applied?: boolean;
  createdAt?: string;
  updatedAt?: string;
  
  // Visibility & Faculty Recommendations (Section 8 & 9)
  visibility?: 'PUBLIC' | 'FACULTY_ONLY' | 'RECOMMENDED';
  recommendations?: OpportunityRecommendation[];
  
  tags: string[];
}

export interface OpportunityRecommendation {
  id: string;
  opportunityId: string;
  facultyId: string;
  facultyName: string;
  targetYear: number;        // e.g. 3 for 3rd Year
  targetYearLabel: string;   // e.g. "3rd Year"
  message?: string;
  recommendedAt: string;
  isActive: boolean;
}

export interface StudentProject {
  id: string;
  title: string;
  description: string;
  progress: number;
  mentor: string;
  teamMembers: string[];
  requiredResources: string[];
  bookedResourceIds: string[];
  milestones: { title: string; completed: boolean }[];
  status: 'In Progress' | 'Planning' | 'Completed';
}

export interface StudentProgress {
  overallReadiness: number;
  dsaScore: number;
  aptitudeScore: number;
  csFundamentalsScore: number;
  projectsScore: number;
  communicationScore: number;
}

// ==========================================
// EVENTS & CLUBS SYSTEM TYPES
// ==========================================

export type EventCategory =
  | 'TECHNICAL'
  | 'HACKATHON'
  | 'WORKSHOP'
  | 'CULTURAL'
  | 'SPORTS'
  | 'SEMINAR'
  | 'COMPETITION'
  | 'ORIENTATION';

export type EventFormat = 'IN_PERSON' | 'HYBRID' | 'ONLINE';

export type EventRegistrationStatus = 'OPEN' | 'FAST_FILLING' | 'CLOSING_SOON' | 'CLOSED';

export interface CampusEvent {
  id: string;
  title: string;
  tagline: string;
  description: string;
  detailedAgenda?: string[];
  clubId: string;
  clubName: string;
  clubLogo?: string;
  category: EventCategory;
  categoryLabel: string;
  format: EventFormat;
  date: string;
  time: string;
  venue: string;
  bannerUrl?: string;
  capacity: number;
  registeredCount: number;
  registrationStatus: EventRegistrationStatus;
  isOdApproved: boolean;
  odHours?: string;
  entryFee: 'FREE' | string;
  eligibility: string;
  prerequisites?: string[];
  facultyCoordinator: {
    name: string;
    department: string;
    contact?: string;
  };
  studentCoordinators: Array<{
    name: string;
    role: string;
    phone: string;
  }>;
  speakers?: Array<{
    name: string;
    role: string;
    company: string;
    avatar?: string;
  }>;
  perks?: string[];
  isRegistered?: boolean;
  userTicketId?: string;
}

export type ClubCategory =
  | 'TECHNICAL'
  | 'CULTURAL'
  | 'ENTREPRENEURSHIP'
  | 'ROBOTICS'
  | 'LITERARY'
  | 'SPORTS'
  | 'SOCIAL_NSS'
  | 'MEDIA_DESIGN';

export interface ClubRecruitment {
  id: string;
  roleTitle: string;
  department: string;
  openings: number;
  deadline: string;
  eligibility: string;
  description: string;
}

export interface CampusClub {
  id: string;
  name: string;
  shortCode: string;
  tagline: string;
  description: string;
  category: ClubCategory;
  categoryLabel: string;
  foundedYear: number;
  memberCount: number;
  rating: number;
  tier: 'TIER_1_OFFICIAL' | 'TIER_2_DEPARTMENTAL' | 'STUDENT_INITIATIVE';
  logoUrl?: string;
  bannerGradient: string;
  facultyMentor: {
    name: string;
    designation: string;
    department: string;
  };
  president: {
    name: string;
    year: string;
    rollNumber: string;
    email: string;
  };
  regularMeetup: {
    frequency: string;
    time: string;
    location: string;
  };
  achievements: string[];
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    github?: string;
    discord?: string;
  };
  activeRecruitments?: ClubRecruitment[];
  isJoined?: boolean;
  userRole?: string;
}

export interface EventRegistration {
  id: string;
  ticketCode: string;
  eventId: string;
  eventTitle: string;
  clubName: string;
  date: string;
  time: string;
  venue: string;
  studentName: string;
  rollNumber: string;
  department: string;
  registeredAt: string;
  isOdApproved: boolean;
  status: 'CONFIRMED' | 'ATTENDED' | 'CANCELLED';
  qrPayload: string;
}

export interface ClubMembershipApplication {
  id: string;
  clubId: string;
  clubName: string;
  studentName: string;
  rollNumber: string;
  academicYear: string;
  department: string;
  roleApplied: string;
  statementOfPurpose: string;
  pastExperience?: string;
  portfolioOrGithub?: string;
  submittedAt: string;
  status: 'SUBMITTED' | 'INTERVIEW_SCHEDULED' | 'ACCEPTED' | 'REJECTED';
}

