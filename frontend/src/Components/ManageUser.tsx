import { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import { FaFileDownload, FaUserAlt, FaClipboardList, FaEnvelope, FaClock, FaArrowLeft } from "react-icons/fa";
import "./ManageUser.css";

type Feedback = {
    id: number;
    heading: string;
    category: string;
    subcategory: string;
    message: string;
    submittedAt: string;
    imageUrl?: string;
    sentiment: "Positive" | "Negative" | "Neutral" | "Mixed";
};

type UserWithFeedbacks = {
    id: number;
    fullName: string;
    email: string;
    feedbacks: Feedback[];
};

const feedbacksPerPage = 6;

const ManageUsersPage = () => {
    const [users, setUsers] = useState<UserWithFeedbacks[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentUserPage, setCurrentUserPage] = useState(0);
    const [currentFeedbackPage, setCurrentFeedbackPage] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await API.get("/admin/users-with-feedbacks");
                setUsers(res.data);
            } catch (err) {
                console.error("Error fetching users", err);
            }
        };
        fetchUsers();
    }, []);

    const exportUserFeedbacks = (user: UserWithFeedbacks) => {
        const header = [
            "Heading",
            "Category",
            "Subcategory",
            "Message",
            "Submitted At",
        ];
        const rows = user.feedbacks.map((fb) => [
            fb.heading,
            fb.category,
            fb.subcategory,
            fb.message.replace(/"/g, '""'),
            new Date(fb.submittedAt).toLocaleString(),
        ]);
        const csv = [header, ...rows].map((row) => row.join(",")).join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${user.fullName.replace(/\s+/g, "_")}_feedbacks.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getSentimentEmoji = (sentiment: string) => {
        switch (sentiment) {
            case "Positive": return "😊";
            case "Negative": return "😠";
            case "Neutral": return "😐";
            case "Mixed": return "🤔";
            default: return "🤔";
        }
    };
    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case "Positive":
                return "#d4edda";
            case "Negative":
                return "#f8d7da";
            case "Neutral":
                return "#fff3cd";
            case "Mixed":
            default:
                return "#d1ecf1";
        }
    };


    const filteredUsers = users.filter(
        user =>
            user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const currentUser = filteredUsers[currentUserPage] || null;

    const feedbacksToShow = currentUser?.feedbacks.slice(
        currentFeedbackPage * feedbacksPerPage,
        (currentFeedbackPage + 1) * feedbacksPerPage
    );

    const totalFeedbackPages = currentUser ? Math.ceil(currentUser.feedbacks.length / feedbacksPerPage) : 0;

    // Reset feedback pagination when user page changes
    useEffect(() => {
        setCurrentFeedbackPage(0);
    }, [currentUserPage]);

    return (
        <div className="manage-users-page">

            {/* HEADER SECTION */}
            <div className="topbar">
                <h2><span className="highlight">User</span> Management</h2>
                <div className="stats-buttons">
                    <div className="stat-card orange"> Total Users: {users.length}</div>
                    <div className="stat-card orange-outline"> <FaClipboardList /> Total Feedbacks: {users.reduce((acc, user) => acc + user.feedbacks.length, 0)}</div>
                    <button className="btn-primary" onClick={() => navigate("/admin")}> <FaArrowLeft /> Back to Dashboard</button>
                </div>
            </div>

            {/* SEARCH BAR */}
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search user by name or email..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentUserPage(0);
                    }}
                />
            </div>


            {/* USER CARD + FEEDBACK GRID */}
            {filteredUsers.length > 0 && currentUser ? (
                <div key={currentUser.id} className="user-container">
                    <div className="user-header">
                        <div className="user-left">
                            <p> <FaUserAlt />{currentUser.fullName}</p>
                            <p> <FaEnvelope />{currentUser.email}</p>
                        </div>
                        <div className="user-right">
                            <p><strong>Total Feedbacks:</strong> {currentUser.feedbacks.length}</p>
                            {currentUser.feedbacks.length > 0 && (
                                <button onClick={() => exportUserFeedbacks(currentUser)} className="btn-export">
                                   <FaFileDownload /> Export Feedbacks
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="feedback-section">
                        {feedbacksToShow && feedbacksToShow.length > 0 ? (
                            feedbacksToShow.map((fb) => (
                                <div key={fb.id} className="feedback-card">
                                    <div className="feedback-card-header">
                                        <div
                                            className="sentiment-badge"
                                            style={{ backgroundColor: getSentimentColor(fb.sentiment) }}
                                        >
                                            {getSentimentEmoji(fb.sentiment)} {fb.sentiment}
                                        </div>
                                    </div>

                                    <h2 className="feedback-heading">{fb.heading}</h2>

                                    <p className="feedback-category">
                                        <h3>{fb.category} / <span>{fb.subcategory}</span></h3>
                                    </p>

                                    {fb.imageUrl ? (
                                        <>
                                            <img src={fb.imageUrl} alt="feedback" className="feedback-image" />
                                            <div className="feedback-content-scrollable">
                                                <p className="feedback-message">{fb.message}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="feedback-content-full">
                                            <p className="feedback-message">{fb.message}</p>
                                        </div>
                                    )}

                                    <div className="feedback-footer">
                                        <p className="submitted-time"><FaClock />{new Date(fb.submittedAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-feedback-text">No feedbacks to show.</p>
                        )}
                    </div>


                    {/* INNER PAGINATION */}
                    {totalFeedbackPages > 1 && (
                        <div className="pagination-bar">
                            <button
                                onClick={() => setCurrentFeedbackPage((p) => Math.max(p - 1, 0))}
                                disabled={currentFeedbackPage === 0}
                            >
                                ⬅ Prev
                            </button>
                            <span>Page {currentFeedbackPage + 1} of {totalFeedbackPages}</span>
                            <button
                                onClick={() => setCurrentFeedbackPage((p) => Math.min(p + 1, totalFeedbackPages - 1))}
                                disabled={currentFeedbackPage === totalFeedbackPages - 1}
                            >
                                Next ➡
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <p>No users match your search.</p>
            )}
            {/* OUTER PAGINATION */}
            {filteredUsers.length > 1 && (
                <div className="pagination-bar">
                    <button
                        onClick={() => setCurrentUserPage((p) => Math.max(p - 1, 0))}
                        disabled={currentUserPage === 0}
                    >
                        ⬅ Prev User
                    </button>
                    <span>User {currentUserPage + 1} of {filteredUsers.length}</span>
                    <button
                        onClick={() => setCurrentUserPage((p) => Math.min(p + 1, filteredUsers.length - 1))}
                        disabled={currentUserPage === filteredUsers.length - 1}
                    >
                        Next User ➡
                    </button>
                </div>
            )}

        </div>
    );
};

export default ManageUsersPage;
