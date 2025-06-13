import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendURL } from "../config";

function UserList({ token }) {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${backendURL}/api/user/users`);
      if (res.data.success) {
        setUsers(res.data.users);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error fetching users");
    }
  };

  const handleBlockToggle = async (userId, block) => {
    try {
      const res = await axios.post(
        `${backendURL}/api/user/block`,
        { userId, block },
        { headers: { Authorization: `Bearer ${token}` } }
      ); 
      if (res.data.success) {
        toast.success(res.data.message);
        fetchUsers(); // refresh list
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
      <p className="mb-2">All Users</p>
      <div className="flex flex-col gap-2">
        {/* Table Header */}
        <div className="grid grid-cols-4 md:grid-cols-6 bg-gray-100 text-sm font-bold py-2 px-2 border">
          <div>Name</div>
          <div className="md:col-span-2">Email</div>
          <div>Verified</div>
          <div>Status</div>
          <div className="text-center">Action</div>
        </div>

        {/* Table Rows */}
        {users.map((user) => (
          
          <div
            key={user.userId}
            className="grid grid-cols-4 md:grid-cols-6 items-center text-sm py-1 px-2 border "
          >
           
            <div>{user.name}</div>
            <div className="md:col-span-2">{user.email}</div>
            <div>{user.isAccountVerified ? "Yes" : "No"}</div>
            <div>{user.isBlocked ? "Blocked" : "Active"}</div>
            <div className="text-center">
              <button
                className={`px-2 py-1 rounded ${
                  user.isBlocked ? "bg-green-500" : "bg-red-500"
                } text-white`}
                onClick={() => handleBlockToggle(user.userId, !user.isBlocked)}
              >
                {user.isBlocked ? "Unblock" : "Block"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default UserList;
