import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "react-oidc-context";
import Modal from "./modal";
import clsx from "clsx";
import router, { useRouter } from "next/router";
export type scheduleCard = {
  owner: boolean;
  scheduleId: string;
  scheduleName: string;
  isPublic: boolean;
  onDelete: (scheduleId: string) => void;
  onUpdate: () => void;
};
const ScheduleCard = ({
  owner,
  scheduleId,
  scheduleName,
  isPublic,
  onDelete,
  onUpdate,
}: scheduleCard): React.ReactElement => {
  const auth = useAuth();
  const [hoveredEdit, setHoveredEdit] = useState(false);
  const [hoverdSetting, setHoveredSetting] = useState(false);
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const checkHover = () => {
    if (isSettingOpen) {
      setHoveredSetting(true);
    } else {
      setHoveredSetting(false);
    }
  };

  const toggleSettingDropdown = (): void => {
    setIsSettingOpen(!isSettingOpen);
  };

  const [openDeleteModal, setDeleteModal] = useState(false);
  const handleDeleteModal = () => {
    setDeleteModal(!openDeleteModal);
  };

  const [openExportModal, setExportModal] = useState(false);
  const handleExportModal = () => {
    setExportModal(!openExportModal);
  };

  const [copied, setCopied] = useState(false);
  const handleCopy2Clipboard = () => {
    navigator.clipboard.writeText(`${scheduleId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    console.log("Downloaded");
  };

  const handleImport = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8080/schedule/copySchedule/${scheduleId}`,
        {}, // empty data payload
        {
          headers: {
            token: auth.user?.access_token,
          },
        }
      );
      try {
        await axios.get(`http://localhost:8080/schedule`, {
          headers: { token: auth.user?.access_token },
        });
      } catch (error) {
        console.error("Error fetching schedule:", error);
      }
      console.log(response.data); // Assuming you want to log the response data
    } catch (error) {
      console.error("Error creating schedule:", error);
    }
  };

  const handleBookmark = async (scheduleId: string, scheduleName: string) => {
    try {
      const result = await axios.patch(
        `http://localhost:8080/user/bookmark`,
        {
          data: {
            scheduleName: scheduleName,
            scheduleId: scheduleId,
          },
        },
        {
          headers: { token: auth.user?.access_token },
        }
      );
      console.log(result.data);
      onUpdate();
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  };

  const [openPublishModal, setPublishModal] = useState(false);
  const handlePublishModal = () => {
    setPublishModal(!openPublishModal);
  };

  const [isPublished, setPublist] = useState(isPublic);
  const changeStatePrivate = async () => {
    try {
      const response = await axios.put(
        `http://localhost:8080/schedule/publish/${scheduleId}`,
        { isPublish: false }
      );
      console.log(response.data); // Assuming you want to log the response data
    } catch (error) {
      console.error("Error creating schedule:", error);
    }
  };
  const changeStatePublish = async () => {
    try {
      const response = await axios.put(
        `http://localhost:8080/schedule/publish/${scheduleId}`,
        { isPublish: true }
      );
      console.log(response.data); // Assuming you want to log the response data
    } catch (error) {
      console.error("Error creating schedule:", error);
    }
  };
  const handleChange2Publish = async () => {
    await changeStatePublish();
    setPublist(true);
    onUpdate();
    console.log("Change stute to ublish complete");
  };
  const handleChange2Private = async () => {
    await changeStatePrivate();
    setPublist(false);
    onUpdate();
    console.log("Change stute to private complete");
  };

  const DeleteSchedule = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:8080/schedule/${scheduleId}`
      );
      // handleDelete();
      console.log(response.data); // Assuming you want to log the response data
    } catch (error) {
      console.error("Error creating schedule:", error);
    }
  };

  const handleDeleteSchedule = () => {
    DeleteSchedule();
    onDelete(scheduleId); // เรียกใช้ callback function ที่ส่งเข้ามาเพื่อลบการ์ด
    console.log(`${scheduleName} is deleted`);
    setDeleteModal(false);
  };

  const [title, setTitle] = useState([`${scheduleName}`]);
  const [isEditing, setEditing] = useState(false);
  const handleEditTitle = () => {
    setEditing(true);
  };
  const handleEditOff = () => {
    handleTitleChangeNSent();
    setEditing(false);
  };

  const ChangeTitle = async () => {
    try {
      const response = await axios.put(
        `http://localhost:8080/schedule/updateName/${title}/${scheduleId}`
      );
      console.log(response.data); // Assuming you want to log the response data
      onUpdate();
    } catch (error) {
      console.error("Error creating schedule:", error);
    }
  };
  const handleTitleChange = (event: any) => {
    setTitle(event.target.value);
  };
  const handleTitleChangeNSent = () => {
    ChangeTitle();
  };

  const handleEnterPress = (event: any) => {
    if (event.key === "Enter") {
      ChangeTitle();
      setEditing(false);
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      if (isEditing) {
        inputRef.current.style.width = `${
          inputRef.current.value.length * 12
        }px`;
      } else {
        inputRef.current.style.width = `${inputRef.current.scrollWidth}px`;
      }
    }
    const handleClick = (event: MouseEvent): void => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsSettingOpen(false);
        setHoveredSetting(false);
      }
    };

    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [isEditing]);
  

  return (
    <div>
      {owner === true ? (
        <>
          <Modal
            isOpen={openDeleteModal}
            onClose={(): void => {
              setDeleteModal(false);
            }}
          >
            <div className="relative h-[210px] w-[full] bg-Grey-200 flex justify-between flex-col text-Green-500">
              <button
                className="absolute -right-4 -top-4 z-40"
                onClick={handleDeleteModal}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6 cursor-pointer"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {/* Title */}
              <div className=" flex items-center ">
                <h1 className="text-2xl font-bold flex-1 text-Green-500 flex justify-center font-noto">
                  คุณต้องการลบตารางนี้ใช่หรือไม่?
                </h1>
              </div>
              {/* Description */}
              <div className="mb-[24px] text-xl line-clamp-3 w-full flex flex-col justify-center items-center text-Green-500 font-noto">
                <div>{`คุณกำลังจะลบ "${scheduleName}"`}</div>
                <div>เมื่อดำเนินการไปแล้วไม่สามารถกู้ไฟล์กลับคืนมาได้</div>
              </div>
              {/* Button */}
              <div className="flex justify-center space-x-[16px] text-lg font-noto">
                <button
                  className="h-[40px] w-[100px] rounded bg-Blue-500 text-white "
                  onClick={() => {
                    handleDeleteSchedule();
                  }}
                >
                  ยืนยัน
                </button>
                <button
                  className="h-[40px] w-[100px] rounded bg-Grey-300 text-Green-500"
                  onClick={() => {
                    handleDeleteModal();
                  }}
                >
                  {"ยกเลิก"}
                </button>
              </div>
            </div>
          </Modal>

          <Modal
            isOpen={openPublishModal}
            onClose={(): void => {
              setPublishModal(false);
            }}
          >
            <div className="relative h-[280px] w-[full] bg-Grey-200 flex justify-between flex-col text-Green-500">
              <button
                className="absolute -right-4 -top-4 z-40"
                onClick={handlePublishModal}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6 cursor-pointer"
                  onClick={() => {}}
                >
                  <path
                    fillRule="evenodd"
                    d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {/* Title */}
              <div className=" flex items-center ">
                <h1 className="text-2xl font-bold flex-1 text-Green-500 flex justify-center font-noto">
                  ใครจะเห็นตารางคุณบ้าง
                </h1>
              </div>
              {/* Description */}
              <div className=" text-xl w-full flex flex-col justify-center items-start space-y-3 ">
                <button
                  className={clsx(
                    !isPublished && "border-2 border-Grey-500 rounded",
                    isPublished && "border-2 border-Grey-200",
                    "flex flex-row justify-start items-center space-x-3 p-2 w-full border-2 border-Grey-200 hover:bg-Grey-300 hover:rounded"
                  )}
                  onClick={() => {
                    handleChange2Private();
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="19"
                    height="16"
                    fill="currentColor"
                    className="bi bi-lock-fill"
                  >
                    <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2m3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2" />
                  </svg>
                  <div className="flex flex-col justify-center items-start font-noto">
                    <div>ส่วนตัว</div>
                    <div className="text-lg ">เฉพาะคุณเท่านั้นที่ดูได้</div>
                  </div>
                </button>
                <button
                  className={clsx(
                    isPublished && "border-2 border-Grey-500 rounded",
                    !isPublished && "border-2 border-Grey-200",
                    "flex flex-row justify-start items-center space-x-3 p-2 w-full border-2 border-Grey-200 hover:bg-Grey-300 hover:rounded"
                  )}
                  onClick={() => {
                    handleChange2Publish();
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="19"
                    height="19"
                    fill="currentColor"
                    className="bi bi-globe"
                  >
                    <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.5-6.923c-.67.204-1.335.82-1.887 1.855A8 8 0 0 0 5.145 4H7.5zM4.09 4a9.3 9.3 0 0 1 .64-1.539 7 7 0 0 1 .597-.933A7.03 7.03 0 0 0 2.255 4zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a7 7 0 0 0-.656 2.5zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5zM8.5 5v2.5h2.99a12.5 12.5 0 0 0-.337-2.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5zM5.145 12q.208.58.468 1.068c.552 1.035 1.218 1.65 1.887 1.855V12zm.182 2.472a7 7 0 0 1-.597-.933A9.3 9.3 0 0 1 4.09 12H2.255a7 7 0 0 0 3.072 2.472M3.82 11a13.7 13.7 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5zm6.853 3.472A7 7 0 0 0 13.745 12H11.91a9.3 9.3 0 0 1-.64 1.539 7 7 0 0 1-.597.933M8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855q.26-.487.468-1.068zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.7 13.7 0 0 1-.312 2.5m2.802-3.5a7 7 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7 7 0 0 0-3.072-2.472c.218.284.418.598.597.933M10.855 4a8 8 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4z" />
                  </svg>
                  <div className="flex flex-col justify-center items-start font-noto">
                    <div>สาธารณะ</div>
                    <div className="text-lg">
                      ทุกคนที่อยู่คณะและสาขาเดียวกันกับคุณที่ใช้ ScheduleUP
                    </div>
                  </div>
                </button>
              </div>
              {/* Button */}
              <div className="flex justify-end space-x-[16px] text-lg">
                <button
                  className="h-[40px] w-[100px] rounded bg-Blue-500 text-white font-noto"
                  onClick={() => {
                    handlePublishModal();
                  }}
                >
                  เสร็จสิ้น
                </button>
              </div>
            </div>
          </Modal>

          <Modal
            isOpen={openExportModal}
            onClose={(): void => {
              setExportModal(false);
            }}
          >
            <div className="relative h-[200px] w-[full] bg-Grey-200 flex justify-between flex-col text-Green-500">
              <button
                className="absolute -right-4 -top-4 z-40"
                onClick={handleExportModal}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6 cursor-pointer"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {/* Title */}
              <div className=" flex items-center ">
                <h1 className="text-2xl font-bold flex-1 text-green-500 flex justify-center font-noto">
                  ส่งออกตาราง “ {scheduleName} ”
                </h1>
              </div>
              {/* Description */}
              <div className="mb-[24px] text-xl line-clamp-3 w-full flex flex-row space-x-2 justify-center items-center font-noto">
                <div>รหัสตาราง</div>
                <div className="bg-Grey-300 p-2 rounded">{scheduleId}</div>
              </div>
              {/* Button */}
              <div className="flex justify-center space-x-[16px] text-lg">
                <button
                  className="h-[40px] w-[100px] rounded bg-Blue-500 text-white font-noto"
                  onClick={() => {
                    handleCopy2Clipboard();
                  }}
                >
                  {copied ? <>คัดลอกแล้ว</> : <>คัดลอก</>}
                </button>
                <button
                  className="h-[40px] w-[100px] rounded bg-Grey-300 text-Green-500 font-noto"
                  onClick={() => {
                    handleExportModal();
                  }}
                >
                  เสร็จสิ้น
                </button>
              </div>
            </div>
          </Modal>
        </>
      ) : null}

      <div
        className="relative flex flex-col items-center justify-evenly rounded-xl w-[320px] h-[240px] bg-Grey-200 text-Green-500"
        onMouseEnter={() => setHoveredSetting(true)}
        onMouseLeave={() => checkHover()}
      >
        {isSettingOpen && owner ? (
          <div className="absolute flex mx-auto my-auto flex-col items-start pt-1 w-auto px-2 h-auto bg-white border-2 border-Grey-500 text-base top-7 -right-[140px]  z-40 font-normal rounded-md font-noto  ">
            <div className="top-7 -right-[140px]  z-40">
              <button className="flex flex-row space-x-2 items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="currentColor"
                  className="bi bi-file-earmark-arrow-down"
                  viewBox="0 0 16 16"
                >
                  <path d="M8.5 6.5a.5.5 0 0 0-1 0v3.793L6.354 9.146a.5.5 0 1 0-.708.708l2 2a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 10.293z" />
                  <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z" />
                </svg>

                <div>ดาวน์โหลดตาราง</div>
              </button>
              <button
                className="flex flex-row space-x-2 items-center"
                onClick={() => handleExportModal()}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="currentColor"
                  className="bi bi-upload"
                  viewBox="0 0 16 16"
                >
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
                  <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708z" />
                </svg>
                <div>ส่งออกตาราง</div>
              </button>
              <button
                className="flex flex-row space-x-2 items-center"
                onClick={handleDeleteModal}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="currentColor"
                  className="bi bi-trash"
                  viewBox="0 0 16 16"
                >
                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                  <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                </svg>

                <div>ลบตาราง</div>
              </button>
            </div>
          </div>
        ) : isSettingOpen && !owner ? (
          <div className="absolute flex mx-auto my-auto flex-col items-start pt-1 w-auto px-2 h-auto bg-white border-2 border-Grey-500 text-base top-7 -right-[190px]  z-40 font-normal rounded-md">
            <button
              className="flex flex-row space-x-2 items-center"
              onClick={() => handleDownload()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="currentColor"
                className="bi bi-file-earmark-arrow-down"
                viewBox="0 0 16 16"
              >
                <path d="M8.5 6.5a.5.5 0 0 0-1 0v3.793L6.354 9.146a.5.5 0 1 0-.708.708l2 2a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 10.293z" />
                <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z" />
              </svg>

              <div>ดาวน์โหลดตาราง</div>
            </button>
            <button
              className="flex flex-row space-x-2 items-center"
              onClick={() => handleImport()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-upload"
                viewBox="0 0 16 16"
              >
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
                <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708z" />
              </svg>
              <div>นำเข้าไปยังตารางของฉัน</div>
            </button>
            <button
              className="flex flex-row space-x-2 items-center"
              onClick={() => handleBookmark(scheduleId, scheduleName)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-bookmark"
                viewBox="0 0 16 16"
              >
                <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1z" />
              </svg>

              <div>บันทึกไปยังบุ๊กมาร์ก</div>
            </button>
          </div>
        ) : null}

        {/*schedule and setting button */}
        <div className="absolute top-2 right-1 z-40">
          {hoverdSetting ? (
            <div ref={dropdownRef}>
              <button onClick={toggleSettingDropdown}>
                <div className="absolute top-0 right-0 z-40">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-three-dots-vertical"
                    viewBox="0 0 16 16"
                  >
                    <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
                  </svg>
                </div>
              </button>
            </div>
          ) : null}
        </div>
        <div
          onClick={() => {
            router.push("/schedule/" + scheduleId);
          }}
          className="w-[280px] h-[200px] border rounded-xl flex justify-center items-center cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="size-12"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
            />
          </svg>
        </div>
      </div>
      <div className="relative">
        <div
          className=" w-auto h-[40px] flex flex-row items-center justify-between px-2"
          onMouseEnter={() => setHoveredEdit(true)}
          onMouseLeave={() => setHoveredEdit(false)}
        >
          {/*name and publisher */}
          <div className=" flex flex-row items-center space-x-1">
            <div className=" text-white font-medium text-base w-full font-noto">
              {isEditing && owner ? (
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  onSubmit={handleTitleChangeNSent}
                  onKeyPress={handleEnterPress}
                  ref={inputRef}
                  className="rounded-lg bg-white bg-opacity-30 w-full py-0.5 px-2"
                  disabled={!isEditing}
                />
              ) : (
                <div className="text-ellipsis text-white font-medium text-base overflow-hidden max-w-[240px] line-clamp-1 px-2">
                  {scheduleName}
                </div>
              )}
            </div>

            {hoveredEdit && owner ? (
              <div>
                {isEditing && owner ? (
                  <button onClick={() => handleEditOff()}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="white"
                      className="bi bi-check-circle-fill"
                      viewBox="0 0 16 16"
                    >
                      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                    </svg>
                  </button>
                ) : (
                  <div>
                    <button
                      className="text-Green-500 "
                      onClick={() => handleEditTitle()}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="white"
                        className="bi bi-pencil-fill"
                        viewBox="0 0 16 16"
                      >
                        <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div></div>
            )}
          </div>
          <div>
            <button
              onClick={() => {
                handlePublishModal();
              }}
              disabled={!owner}
            >
              {isPublished ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-globe"
                >
                  <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.5-6.923c-.67.204-1.335.82-1.887 1.855A8 8 0 0 0 5.145 4H7.5zM4.09 4a9.3 9.3 0 0 1 .64-1.539 7 7 0 0 1 .597-.933A7.03 7.03 0 0 0 2.255 4zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a7 7 0 0 0-.656 2.5zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5zM8.5 5v2.5h2.99a12.5 12.5 0 0 0-.337-2.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5zM5.145 12q.208.58.468 1.068c.552 1.035 1.218 1.65 1.887 1.855V12zm.182 2.472a7 7 0 0 1-.597-.933A9.3 9.3 0 0 1 4.09 12H2.255a7 7 0 0 0 3.072 2.472M3.82 11a13.7 13.7 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5zm6.853 3.472A7 7 0 0 0 13.745 12H11.91a9.3 9.3 0 0 1-.64 1.539 7 7 0 0 1-.597.933M8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855q.26-.487.468-1.068zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.7 13.7 0 0 1-.312 2.5m2.802-3.5a7 7 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7 7 0 0 0-3.072-2.472c.218.284.418.598.597.933M10.855 4a8 8 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="19"
                  height="16"
                  fill="currentColor"
                  className="bi bi-lock-fill"
                >
                  <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2m3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCard;
