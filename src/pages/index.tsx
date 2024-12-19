import Image from "next/image";
import { Inter } from "next/font/google";
import { useAuth } from "react-oidc-context";
import NavigationBar from "@/components/NavBar";
import ScheduleCard from "@/components/ProfileScheduleCard";
import axios from "axios";
import Modal from "@/components/testmodal";
import { useCallback, useEffect, useState } from "react";
import TermsAndConditionsModal from "@/components/TermsAndConditionsModal";
import { useRouter } from "next/router";
import Loading from "@/components/Loading";

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const [studentDetail, setStudentDetail] = useState<{
    studentId: string;
    isVerify: boolean;
    studNameThai: string;
    studSnameThai: string;
    studNameEng: string;
    studSnameEng: string;
    pictureBase64: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStudentData = useCallback(async () => {
    try {
      const result = await axios.get(`http://localhost:8080/user/userData`, {
        headers: {
          token: auth.user?.access_token,
        },
      });
      console.log(result.data);
      setStudentDetail(result.data);
    } catch (error) {
      console.error("Error fetching student details:", error);
    }
  }, [auth.user?.access_token]);

  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      fetchStudentData();
    }
  }, [auth.isAuthenticated, auth.user, fetchStudentData]);

  if (auth.isLoading) {
    return <Loading/>;
  }
  
  return (
    <>
      {auth.isAuthenticated && studentDetail ? (
        <div
          className="min-h-screen flex items-center justify-center w-full dark:bg-gray-950 font-noto"
          style={{
            backgroundImage:
              "url(https://eila.psu.ac.th/wp-content/uploads/2023/03/img-journey-3d-place-psu-00026.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div
            className="dark:bg-gray-900 px-8 py-6 max-w-md flex flex-col gap-3"
            style={{
              background: "rgba( 0, 0, 0, 0.45 )",
              boxShadow: "0 8px 32px 0 rgba( 31, 38, 135, 0.37 )",
              backdropFilter: "blur( 20px )",
              WebkitBackdropFilter: "blur( 20px )",
              borderRadius: "10px",
            }}
          >
            <h1 className="text-2xl font-semibold text-center dark:text-gray-200">
              ยินดีต้อนรับ
            </h1>

            <div className="flex flex-row justify-center">
              <div
                title="profile-button"
                className="size-24 relative aspect-square"
              >
                {studentDetail.pictureBase64 && auth.user ? (
                  <Image
                    className="rounded-full object-cover"
                    src={studentDetail?.pictureBase64}
                    fill
                    alt=""
                  />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-8 rounded-full object-cover"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-medium text-center mb-2 dark:text-gray-200">
                {studentDetail.studNameThai} {studentDetail.studSnameThai}
              </h2>
              <h2 className="text-sm font-light text-center dark:text-gray-200">
                {studentDetail.studNameEng} {studentDetail.studSnameEng}
              </h2>
            </div>
            {studentDetail.isVerify ? (
              <button
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => {
                  setIsModalOpen(true);
                }}
              >
                Terms and Services
              </button>
            ) : (
              <button
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => {
                  router.push("/home");
                }}
              >
                Go To Homepage
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          className="min-h-screen flex items-center justify-center w-full dark:bg-gray-950 font-noto"
          style={{
            backgroundImage:
              "url(https://eila.psu.ac.th/wp-content/uploads/2023/03/img-journey-3d-place-psu-00026.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div
            className="dark:bg-gray-900 px-8 py-6 max-w-md flex flex-col gap-3"
            style={{
              background: "rgba( 0, 0, 0, 0.45 )",
              boxShadow: "0 8px 32px 0 rgba( 31, 38, 135, 0.37 )",
              backdropFilter: "blur( 20px )",
              WebkitBackdropFilter: "blur( 20px )",
              borderRadius: "10px",
            }}
          >
            <h1 className="text-2xl font-semibold text-center mb-4 dark:text-gray-200">
              ยินดีต้อนรับ
            </h1>
            <div>
              <button
                onClick={() => {
                  auth.signinRedirect();
                }}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                ล็อกอินด้วย PSU Passport
              </button>
            </div>
          </div>
        </div>
      )}
      <TermsAndConditionsModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        studentDetail={studentDetail}
        setStudentDetail={setStudentDetail}
      />
    </>
  );
}
