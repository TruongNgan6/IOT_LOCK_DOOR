import React, { useEffect, useState } from "react";
import EditUser from "../EditUser/EditUser";
import DeleteUser from "../DeleteUser/DeleteUser"; // Import modal xóa người dùng

function UserData() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Trạng thái modal xóa
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null); // User để xóa

  const handleEditClick = (IdCard) => {
    // Gọi API để lấy thông tin người dùng dựa trên idCard
    fetch(`http://localhost:3000/api/get-user-from-admin?IdCard=${IdCard}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          setSelectedUser(data.data); // Kiểm tra lại xem data.data có đúng không
          setIsModalOpen(true); // Mở modal
        } else {
          console.error("Error fetching user data:", data.message);
        }
      })
      .catch((error) => console.error("API fetch error:", error));
    console.log("data", data);
    console.log("data", isModalOpen);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user); // Chọn người dùng để xóa
    setIsDeleteModalOpen(true); // Mở modal xóa
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null); // Đóng modal xóa
  };

  const deleteUser = (IdCard) => {
    // Xóa người dùng khỏi danh sách sau khi xác nhận
    setAttendanceData((prevData) =>
      prevData.filter((record) => record.IdCard !== IdCard)
    );
    closeDeleteModal(); // Đóng modal sau khi xóa
  };

  useEffect(() => {
    fetch("http://localhost:3000/api/attendance")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          setAttendanceData(data.data);
        } else {
          console.error("Error fetching attendance data:", data.message);
        }
      })
      .catch((error) => console.error("API fetch error:", error));
  }, []);

  return (
    <div className="font-sans overflow-x-auto p-10">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100 whitespace-nowrap">
          <tr>
            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              ID Card
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Time Stamp
            </th>
            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200 whitespace-nowrap">
          {attendanceData.map((record) => (
            <tr key={record.IdAttendance}>
              <td className="px-4 py-4 text-sm text-gray-800">
                {record.IdCard}
              </td>
              <td className="px-4 py-4 text-sm text-gray-800">
                <span
                  className={`w-[68px] block text-center py-1 border rounded text-xs ${
                    record.status === 0
                      ? "border-green-500 text-green-600"
                      : record.status === 1
                      ? "border-red-500 text-red-600"
                      : ""
                  }`}
                >
                  {record.status === 0
                    ? "Check in"
                    : record.status === 1
                    ? "Check out"
                    : ""}
                </span>
              </td>
              <td className="px-4 py-4 text-sm text-gray-800">
                {record.timeStamp}
              </td>
              <td className="px-4 py-4 text-sm text-gray-800">
                <button
                  className="text-blue-600 mr-4"
                  onClick={() => handleEditClick(record.IdCard)}
                >
                  Edit
                </button>
                <button
                  className="text-red-600"
                  onClick={() => handleDeleteClick(record)} // Mở modal khi nhấn Delete
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Hiển thị modal khi isModalOpen là true */}
      {isModalOpen && selectedUser && (
        <EditUser user={selectedUser} closeModal={closeModal} />
      )}

      {/* Modal xóa người dùng */}
      {isDeleteModalOpen && userToDelete && (
        <DeleteUser
          user={userToDelete}
          closeModal={closeDeleteModal}
          deleteUser={deleteUser}
        />
      )}
    </div>
  );
}

export default UserData;
