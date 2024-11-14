import React, { useEffect, useState } from "react";

function ReadTagID() {
  const [fillCardInfo, setFillCardInfo] = useState({
    idCard: "",
    fullName: "",
    noPhone: "",
  });

  useEffect(() => {
    fetch("http://localhost:3000/api/get-user")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("data", data);
        if (data.success) {
          setFillCardInfo({
            idCard: data.data.IdCard,
            fullName: data.data.fullName,
            noPhone: data.data.noPhone,
          });
        } else {
          console.error("Error fetching user data:", data.message);
        }
      })
      .catch((error) => console.error("API fetch error:", error));
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen ">
      <form className="space-y-6 px-4 max-w-sm mx-auto font-[sans-serif]">
        <h2 className="text-center text-xl font-bold text-gray-700 mb-4">
          Your Card Info
        </h2>
        <h3 className="text-center text-xl font-bold text-gray-700 mb-4">
          Please tag your Card
        </h3>
        <div className="flex items-center">
          <label className="text-gray-400 w-36 text-sm">ID Card</label>
          <input
            type="text"
            value={fillCardInfo.idCard}
            className="px-2 py-2 w-full border-b-2 focus:border-[#333] outline-none text-sm bg-white"
            readOnly
          />
        </div>

        <div className="flex items-center">
          <label className="text-gray-400 w-36 text-sm">Name</label>
          <input
            type="text"
            value={fillCardInfo.fullName}
            className="px-2 py-2 w-full border-b-2 focus:border-[#333] outline-none text-sm bg-white"
            readOnly
          />
        </div>

        <div className="flex items-center">
          <label className="text-gray-400 w-36 text-sm">Phone No.</label>
          <input
            type="text"
            value={fillCardInfo.noPhone}
            className="px-2 py-2 w-full border-b-2 focus:border-[#333] outline-none text-sm bg-white"
            readOnly
          />
        </div>

        <div class="!mt-12">
          <button
            type="button"
            class="w-full py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            Edit Card
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReadTagID;
