import React, { useState } from "react";

function EditUser({ user, closeModal }) {
  const [fullName, setFullName] = useState(user.fullName);
  const [noPhone, setNoPhone] = useState(user.noPhone);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Kiểm tra xem các trường đã được nhập đầy đủ chưa
    if (!fullName || !noPhone) {
      alert("Please fill in both full name and phone number.");
      return;
    }

    const updatedUser = { IdCard: user.IdCard, fullName, noPhone };

    // Gửi yêu cầu PUT đến API để cập nhật thông tin người dùng
    fetch("http://localhost:3000/api/update-user", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedUser),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Thông báo thành công
          console.log("data", data);

          closeModal(); // Đóng modal nếu cập nhật thành công
          alert("update sucessfully");
        } else {
          // Thông báo lỗi nếu API trả về lỗi
          alert("Error updating user: " + data.message);
        }
      })
      .catch((error) => {
        // Thông báo khi gặp lỗi kết nối API
        alert("API update error: " + error.message);
      });
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div
          id="authentication-modal"
          className="bg-white rounded-lg shadow dark:bg-gray-700 p-4 max-w-md w-full"
        >
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Edit Form
            </h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 rounded-lg text-sm w-8 h-8 flex justify-center items-center dark:hover:bg-gray-600"
              onClick={closeModal}
            >
              <span className="sr-only">Close modal</span>✕
            </button>
          </div>
          <div className="mt-4">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="fullName"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="noPhone"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Phone Number
                </label>
                <input
                  type="text"
                  id="noPhone"
                  value={noPhone}
                  onChange={(e) => setNoPhone(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full text-white bg-blue-700 hover:bg-blue-800 rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600"
              >
                Save
              </button>
            </form>
          </div>
        </div>
      </div>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black opacity-50 z-40"
        onClick={closeModal}
      ></div>
    </>
  );
}

export default EditUser;
