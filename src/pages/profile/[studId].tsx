import { useRouter } from "next/router";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "react-oidc-context";
import NavigationBar from "@/components/NavBar";
import ScheduleCard from "@/components/ProfileScheduleCard";
import Image from "next/image";
import Modal from "@/components/modal";
import { z } from "zod";

interface BookMark {
  scheduleId: string;
  scheduleName: string;
}

export type ProfileProps = {
  studentId: string;
  titleName: string;
  studNameThai: string;
  studSnameThai: string;
  majorNameThai: string;
  deptNameThai: string;
  pictureBase64: string;
  studyLevelName: string;
  BookMark: BookMark[];
};

export const StudentDataScheme = z.object({
  _id: z.string(),
  studentId: z.string(),
  titleNameThai: z.string(),
  studNameThai: z.string(),
  studSnameThai: z.string(),
  studNameEng: z.string(),
  studSnameEng: z.string(),
  majorNameThai: z.string(),
  deptNameThai: z.string(),
  studyLevelName: z.string(),
  stillStudent: z.string(),
  pictureBase64: z.string(),
});

export type StudentData = z.infer<typeof StudentDataScheme>;

interface scheduleSchme {
  scheduleId: string;
  scheduleName: string;
  isPublic: boolean;
  scheduleSubject: any[];
  createdAt: Date;
  updatedAt: Date;
}

interface dataProps {
  schedule: scheduleSchme;
}

const ProfilePage = ({ schedule }: dataProps) => {
  const auth = useAuth();
  const router = useRouter();

  const [studData, setStudData] = useState<StudentData | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<scheduleSchme[] | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudDataNSchedule = async () => {
      try {
        const result = await axios.get(
          `http://localhost:8080/user/userProfile/${router.query.studId}`
        );
        console.log(result.data);
        setStudData(result.data.user);
        setProfileImage(result.data.user.pictureBase64);

        if (router.query.studId === auth.user?.profile.preferred_username) {
          try {
            const result = await axios.get(`http://localhost:8080/schedule`, {
              headers: {
                token: token,
              },
            });
            const allSchedules = result.data.filter(
              (schedule: any) => schedule.isPublic === true
            );
            console.log(allSchedules);
            setSchedules(allSchedules);
          } catch (error) {
            console.error("Error fetching schedule:", error);
          }
        } else {
          const data = result.data.schedules;
          const allSchedules = data.filter(
            (schedule: any) => schedule.isPublic
          );
          console.log(allSchedules);
          setSchedules(allSchedules);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (auth.user) {
      setToken(auth.user?.access_token);
    }

    if (router.query.studId) {
      fetchStudDataNSchedule();
    }
  }, [
    auth.user,
    auth.user?.access_token,
    auth.user?.profile.preferred_username,
    router.query.studId,
    token,
  ]);

  const findSchedule = useCallback(async () => {
    try {
      const result = await axios.get(
        `http://localhost:8080/user/userProfile/${router.query.studId}`
      );
      console.log(result.data);
      setStudData(result.data.user);

      if (result.data.user.pictureBase64.length != 0) {
        setProfileImage(
          "data:image/png;base64," + result.data.user.pictureBase64
        );
      }
      if (router.query.studId === auth.user?.profile.preferred_username) {
        try {
          const result = await axios.get(`http://localhost:8080/schedule`, {
            headers: {
              token: token,
            },
          });
          const allSchedules = result.data.filter(
            (schedule: any) => schedule.isPublic === true
          );
          console.log(allSchedules);
          setSchedules(allSchedules);
        } catch (error) {
          console.error("Error fetching schedule:", error);
        }
      } else {
        const data = result.data.schedules;
        const allSchedules = data.filter((schedule: any) => schedule.isPublic);

        console.log(allSchedules);
        setSchedules(allSchedules);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, [auth.user?.profile.preferred_username, router.query.studId, token]);

  const handleScheduleDelete = (scheduleId: string) => {
    if (schedules)
      setSchedules(
        schedules.filter((schedule) => schedule.scheduleId !== scheduleId)
      );
  };

  const handleOnUpdate = async (): Promise<void> => {
    try {
      findSchedule();
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  };

  return (
    <>
      <div
        className="absolute inset-0 min-h-screen w-full dark:bg-gray-950 font-noto"
        style={{
          backgroundImage:
            "url(https://eila.psu.ac.th/wp-content/uploads/2023/03/img-journey-3d-place-psu-00026.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <NavigationBar />
      <div className="relative min-h-screen w-full px-10 py-6 space-y-5 font-noto overflow-auto">
        <div
          style={{
            background: "rgba( 0, 0, 0, 0.3 )",
            boxShadow: "0 8px 32px 0 rgba( 31, 38, 135, 0.37 )",
            backdropFilter: "blur( 20px )",
            WebkitBackdropFilter: "blur( 20px )",
            borderRadius: "10px",
          }}
          className="p-5"
        >
          {studData ? (
            <div className="min-h-[600px] w-full flex justify-start items-center flex-col">
              <div className="flex flex-col w-full p-5 font-noto text-Grey-200 space-y-4 items-center">
                <div className="flex items-center flex-col ">
                  <div className="">
                    {profileImage ? (
                      <div>
                        <Image
                          src={profileImage}
                          alt="profile-image"
                          className="w-48 h-48 rounded-full mb-[20px]"
                          width={48}
                          height={48}
                        />
                      </div>
                    ) : (
                      <div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="0.5"
                          stroke="currentColor"
                          className="w-52 h-52 text-Grey-200"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className="flex flex-col text-2xl items-center">
                    <div className="flex flex-row text-xl space-x-1 text-Grey-200">
                      <div>{studData.studentId}</div>
                      <div>{studData.titleNameThai}</div>
                      <div>{studData.studNameThai}</div>
                      <div>{studData.studSnameThai}</div>
                    </div>
                    <div className="flex flex-row text-xl space-x-1 text-Grey-200">
                      <div>สาขาวิชา {studData.majorNameThai}</div>
                      <div>{studData.deptNameThai}</div>
                    </div>
                    <div className="flex flex-row text-xl text-Grey-200">
                      <div>{studData.studyLevelName}</div>
                    </div>
                  </span>
                </div>
                <div className="w-full flex flex-col text-2xl space-y-5 justify-center items-start">
                  <div className="flex text-Grey-200 items-start text-2xl justify-start font-noto mb-[20px] font-bold">
                    <span className="flex text-Grey-200items-center text-2xl justify-around">
                      ตารางทั้งหมด
                    </span>
                  </div>
                  <div className="flex flex-col text-2xl space-y-5 justify-center items-center">
                    <div className="flex">
                      {schedules?.length ? (
                        <div className="grid grid-cols-4 gap-12 items-stretch">
                          {schedules.map((e: scheduleSchme, index) => (
                            <ScheduleCard
                              key={e.scheduleId}
                              scheduleName={e.scheduleName}
                              scheduleId={e.scheduleId}
                              isPublic={e.isPublic}
                              owner={false}
                              onDelete={handleScheduleDelete}
                              onUpdate={handleOnUpdate}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex text-Grey-200 items-center text-2xl justify-center font-noto">
                          ขออภัย ไม่พบตารางที่เปิดเป็นสาธารณะ
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : studData == null ? (
            <div className="flex flex-col bg-white text-black font-noto items-center justify-center">
              <Modal
                isOpen={true}
                // onClose={(): void => {
                //   router.push("/")
                // }}
              >
                <div className="relative h-[210px] w-full bg-gray-200 flex justify-between flex-col text-Grey-200">
                  <button
                    className="absolute -right-4 -top-4 z-40"
                    onClick={(): void => {
                      router.push("/");
                    }}
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
                  <div className="flex items-center">
                    <h1 className="text-2xl font-bold flex-1 text-Green-500 flex justify-center">
                      ไม่พบเจอผู้ใช้งาน?
                    </h1>
                  </div>
                  {/* Description */}
                  <div className="mb-[12px] text-xl line-clamp-3 flex w-full flex-col justify-center items-center">
                    <div>{`ไม่พบข้อมูลผู้ใช้ "${router.query.studId}" กรุณาลองใหม่อีกครั้ง`}</div>
                  </div>
                  {/* Button */}
                  <div className="flex justify-center text-lg">
                    <button
                      className="h-[40px] w-[100px] rounded bg-Blue-500 text-white p-2"
                      onClick={(): void => {
                        router.push("/");
                      }}
                    >
                      กลับหน้าแรก
                    </button>
                  </div>
                </div>
              </Modal>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
