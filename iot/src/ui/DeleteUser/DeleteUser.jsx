import React from "react";

function DeleteUser({ user, closeModal, deleteUser }) {
  // Hàm gọi API để xóa người dùng
  const handleDelete = () => {
    // Kiểm tra nếu IdCard không có giá trị
    console.log("Attempting to delete user with IdCard:", user.IdCard);
    if (!user.IdCard) {
      alert("User ID is required.");
      return;
    }

    // Gửi yêu cầu DELETE đến API để xóa người dùng
    fetch("http://localhost:3000/api/delete-user", {
      method: "DELETE", // Sử dụng DELETE để xóa người dùng
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ IdCard: user.IdCard }), // Gửi IdCard người dùng cần xóa
    })
      .then((response) => response.json()) // Parse JSON từ phản hồi của API
      .then((data) => {
        if (data.success) {
          // Thông báo thành công
          console.log("User deleted successfully:", data);

          // Gọi hàm để xóa người dùng khỏi danh sách trên frontend (có thể là cập nhật lại state)
          deleteUser(user.IdCard); // Thực hiện xóa người dùng từ danh sách

          closeModal(); // Đóng modal sau khi xóa thành công
          alert("User deleted successfully.");
        } else {
          // Thông báo lỗi nếu API trả về lỗi
          alert("Error deleting user: " + data.message);
        }
      })
      .catch((error) => {
        // Thông báo khi gặp lỗi kết nối API
        alert("API delete error: " + error.message);
      });
  };

  return (
    <>
      <div
        id="popup-modal"
        tabIndex="-1"
        className="fixed top-0 left-0 right-0 z-50 w-full h-full flex justify-center items-center bg-gray-500 bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg w-80">
          <h3 className="text-lg font-semibold text-center mb-4">
            Are you sure you want to delete this user?
          </h3>
          <div className="flex justify-center">
            <button
              onClick={handleDelete}
              className="text-white bg-red-600 hover:bg-red-800 px-4 py-2 rounded mr-2"
            >
              Yes, I'm sure
            </button>
            <button
              onClick={closeModal}
              className="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded"
            >
              No, cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default DeleteUser;
