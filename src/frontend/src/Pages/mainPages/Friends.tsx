import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../Styles/Friends.css";
import Sidebar from "../../components/PageComponets/Sidebar";
import placeholder from "../../assets/placeholder.png";
import { useUser } from "../../lib/UserContext";
import NotificationSidebar from "../../components/PageComponets/NotificationSidebar.tsx";

const API_BASE = "http://localhost:5001";

interface Friend {
  id: string;
  sender_id: string;
  receiver_id: string;
  friendUsername: string;
  friendPfp: string;
}

interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  senderUsername: string;
  senderPfp: string;
}

interface User {
  id: string;
  username: string;
  profile_picture?: string;
}

const Friends: React.FC = () => {
  const { user } = useUser();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchRequests = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/friends/requests/${user.id.toString()}`);
        if (!Array.isArray(res.data)) return;

        const enriched = await Promise.all(
          res.data.map(async (req: FriendRequest) => {
            const senderRes = await axios.get(`${API_BASE}/api/users/${req.sender_id}`);
            return {
              ...req,
              senderUsername: senderRes.data.username,
              senderPfp: senderRes.data.profile_picture || placeholder,
            };
          })
        );
        setRequests(enriched);
      } catch (err) {
        console.error("Failed to fetch requests", err);
      }
    };

    const fetchSentRequests = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/friends/sent/${user.id.toString()}`);
        const enriched = await Promise.all(
          res.data.map(async (req: FriendRequest) => {
            const receiverRes = await axios.get(`${API_BASE}/api/users/${req.receiver_id}`);
            return {
              ...req,
              senderUsername: receiverRes.data.username,
              senderPfp: receiverRes.data.profile_picture || placeholder,
            };
          })
        );
        setSentRequests(enriched);
      } catch (err) {
        console.error("Failed to fetch sent requests", err);
      }
    };

    const fetchFriends = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/friends/${user.id.toString()}`);
        if (!Array.isArray(res.data)) return;

        const enriched = await Promise.all(
          res.data.map(async (relation: Friend) => {
            const otherId = relation.sender_id === user.id.toString()
              ? relation.receiver_id
              : relation.sender_id;
            const otherRes = await axios.get(`${API_BASE}/api/users/${otherId}`);
            return {
              ...relation,
              friendUsername: otherRes.data.username,
              friendPfp: otherRes.data.profile_picture || placeholder,
            };
          })
        );
        setFriends(enriched);
      } catch (err) {
        console.error("Failed to fetch friends", err);
      }
    };

    void fetchRequests();
    void fetchFriends();
    void fetchSentRequests();
  }, [user?.id]);

  const handleAccept = async (requestId: string) => {
    try {
      await axios.post(`${API_BASE}/api/friends/accept/${requestId}`);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      console.error("Error accepting request", err);
    }
  };

  const handleDelete = async (requestId: string) => {
    try {
      await axios.delete(`${API_BASE}/api/friends/${requestId}`);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      console.error("Error deleting request", err);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await axios.delete(`${API_BASE}/api/friends/${requestId}`);
      setSentRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      console.error("Failed to cancel request", err);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      await axios.delete(`${API_BASE}/api/friends/${friendId}`);
      setFriends((prev) => prev.filter((f) => f.id !== friendId));
    } catch (err) {
      console.error("Failed to remove friend", err);
    }
  };

  const handleSearch = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/users?search=${searchQuery}`);
      const filtered = res.data.filter(
        (u: User) =>
          u.id.toString() !== user?.id.toString() &&
          !friends.some(f =>
            f.sender_id === u.id.toString() || f.receiver_id === u.id.toString()
          )
      );
      setSearchResults(filtered);
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  const handleSendRequest = async (targetId: string) => {
    try {
      await axios.post(`${API_BASE}/api/friends/request`, {
        senderId: user?.id.toString(),
        receiverId: targetId,
      });

      // Get the user's data to build the sent request entry
      const receiverRes = await axios.get(`${API_BASE}/api/users/${targetId}`);

      setSentRequests((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(), // fake ID since we don’t get it from backend
          sender_id: user!.id.toString(),
          receiver_id: targetId,
          senderUsername: receiverRes.data.username,
          senderPfp: receiverRes.data.profile_picture || placeholder,
        },
      ]);

      // Clean up search results
      setSearchResults((prev) => prev.filter((u) => u.id !== targetId));
    } catch (err) {
      console.error("Failed to send request", err);
    }
  };

  return (
    <div className="feed-container">
      <Sidebar />
      <NotificationSidebar />

      <main className="feed-content">
        <h2 className="friends-title">Friends</h2>

        <div className="friends-search-bar">
          <input
            type="text"
            placeholder="Search for a user..."
            className="friends-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="add-friend-btn" onClick={handleSearch}>
            Search
          </button>
        </div>

        <div className="friends-sections">
          <div className="friends-list-section">
            <h3 className="section-subtitle">All Friends:</h3>
            {friends.length === 0 ? (
              <p>No friends yet.</p>
            ) : (
              friends.map((friend) => (
                <div key={friend.id} className="friend-entry">
                  <img src={friend.friendPfp} alt="pfp" className="friend-pfp" />
                  <div className="friend-text">
                    <strong>{friend.friendUsername}</strong>
                    <p>Friendship ID: {friend.id}</p>
                  </div>
                  <div className="friend-actions">
                    <button className="view-btn">View</button>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveFriend(friend.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="requests-section">
            <h3 className="section-subtitle">Incoming Requests:</h3>
            {requests.length === 0 ? (
              <p>No incoming requests.</p>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="friend-entry">
                  <img src={req.senderPfp} alt="pfp" className="friend-pfp" />
                  <div className="friend-text">
                    <strong>{req.senderUsername}</strong>
                    <p>has requested to be your friend.</p>
                  </div>
                  <div className="friend-actions">
                    <button className="accept-btn" onClick={() => handleAccept(req.id)}>
                      Accept
                    </button>
                    <button className="remove-btn" onClick={() => handleDelete(req.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="requests-section">
            <h3 className="section-subtitle">Sent Requests:</h3>
            {sentRequests.length === 0 ? (
              <p>No sent requests.</p>
            ) : (
              sentRequests.map((req) => (
                <div key={req.id} className="friend-entry">
                  <img src={req.senderPfp} alt="pfp" className="friend-pfp" />
                  <div className="friend-text">
                    <strong>{req.senderUsername}</strong>
                    <p>Friend request sent.</p>
                  </div>
                  <div className="friend-actions">
                    <button className="remove-btn" onClick={() => handleCancelRequest(req.id)}>
                      Cancel Request
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="search-results-section">
              <h3 className="section-subtitle">Search Results:</h3>
              {searchResults.map((u) => (
                <div key={u.id} className="friend-entry">
                  <img src={u.profile_picture || placeholder} alt="pfp" className="friend-pfp" />
                  <div className="friend-text">
                    <strong>{u.username}</strong>
                  </div>
                  <div className="friend-actions">
                    <button className="accept-btn" onClick={() => handleSendRequest(u.id)}>
                      Add Friend
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

    </div>
  );
};

export default Friends;
