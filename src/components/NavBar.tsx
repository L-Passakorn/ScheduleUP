import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "react-oidc-context";
import PSUlogo from "@/../public/Logo-PSU.png";
import router from "next/router";
import { carnInBookmark } from "@/modules/cardData";
import { z } from "zod";
import { Field, Form, Formik } from "formik";

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
  bookMark: z
    .object({
      scheduleId: z.string(),
      scheduleName: z.string(),
    })
    .array(),
});

export type StudentData = z.infer<typeof StudentDataScheme>;

interface BookMark {
  scheduleId: string;
  scheduleName: string;
}

export const Bookmark = ({
  scheduleId,
  scheduleName,
  reloadBookmarks,
}: BookMark & { reloadBookmarks: () => void }): React.ReactElement => {
  const auth = useAuth();

  const deleteBookmark = async (scheduleId: string, scheduleName: string) => {
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
      reloadBookmarks();
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  };

  return (
    <div className="flex flex-row justify-between items-center w-[380px] px-3 ">
      <div
        className="flex flex-col w-5/6 justify-evenly "
        onClick={() => {
          console.log(`This is schedule of  part body`);
        }}
      >
        <div className="flex flex-row ">
          <div>{scheduleName}</div>
        </div>
        <div className="flex flex-row font-normal">
          <div>{scheduleId}</div>
        </div>
      </div>
      <button
        className="p-2 w-1/6 flex justify-center transition-colors duration-0 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-red-700 dark:hover:text-white"
        onClick={() => {
          deleteBookmark(scheduleId, scheduleName);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="currentColor"
          className="bi bi-x"
          viewBox="0 0 16 16"
        >
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
        </svg>
      </button>
    </div>
  );
};

interface Search {
  studNameThai: string;
  studSnameThai: string;
  studentId: string;
}

export const Search = ({
  studNameThai,
  studSnameThai,
  studentId,
}: Search): React.ReactElement => {
  const auth = useAuth();
  const [studentDetail, setStudentDetail] = useState<StudentData | null>(null);
  useEffect(() => {
    const data = async () => {
      try {
        const result = await axios.get(
          `http://localhost:8080/user/userProfile/${studentId}`,
          {
            headers: {
              token: auth.user?.access_token,
            },
          }
        );
        console.log(result.data);
        setStudentDetail(result.data.user);
      } catch (error) {
        console.error("Error fetching student details:", error);
      }
    };
    data();
  }, [auth.user?.access_token, studentId]);
  return (
    <div className="flex flex-row justify-between items-center w-[380px] w-full ">
      <button
        className="flex font-noto flex-row items-center space-x-2 px-1 w-full transition-colors duration-0 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-red-700 dark:hover:text-white"
        type="button"
        onClick={() => {
          console.log(`This is schedule of  part body`);
          router.push("/profile/" + studentId);
          
        }}
      >
        <div
          title="profile-button"
          className="size-8 relative aspect-square"
        >
          {studentDetail?.pictureBase64 ? (
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
        <div>{studNameThai}</div>
        <div>{studSnameThai}</div>
        <div className="text-Grey-400">{`(${studentId})`}</div>
      </button>
      
    </div>
  );
};

const NavigationBar = (): React.ReactElement => {
  const auth = useAuth();
  const [studentDetail, setStudentDetail] = useState<StudentData | null>(null);
  const [toggleProfileDropdown, setToggleProfileDropdown] = useState(false);
  const [toggleBookmardDropdownn, setToggleBookmarkDropdown] = useState(false);
  const handleToggleProfileDropdown = () => {
    setToggleProfileDropdown(!toggleProfileDropdown);
  };
  const handleToggleBookmarkDropdown = () => {
    setToggleBookmarkDropdown(!toggleBookmardDropdownn);
  };

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

  const userLogin = async () => {
    try {
      const result = await axios.put(
        "http://localhost:8080/user",
        {}, // empty data payload
        {
          headers: {
            token: auth.user?.access_token,
          },
        }
      );
      console.log(result);
    } catch (error) {
      console.error("Error fetching student details:", error);
    }
  };

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (auth.isAuthenticated && auth.user && !studentDetail) {
      // userLogin();
      fetchStudentData();
      // console.log(auth.user.access_token);
    }
    const handleClick = (event: MouseEvent): void => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setToggleProfileDropdown(false);
        setToggleBookmarkDropdown(false);
        setShowDropdown(false)
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [auth.isAuthenticated, auth.user, fetchStudentData, studentDetail]);

  const handleCreate = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/schedule",
        {}, // empty data payload
        {
          headers: {
            token: auth.user?.access_token,
          },
        }
      );
      // console.log(response.data); // Assuming you want to log the response data
      router.push("/schedule/" + response.data.scheduleId);
    } catch (error) {
      console.error("Error creating schedule:", error);
    }
  };

  const handleRoute = () => {
    return () => router.push(`/profile/${studentDetail?.studentId}`);
  };

  const handleDashboard = () => {
    return () => router.push(`/home`);
  };

  const reloadBookmarks = async () => {
    try {
      const result = await axios.get(`http://localhost:8080/user/userData`, {
        headers: {
          token: auth.user?.access_token,
        },
      });
      setStudentDetail(result.data);
    } catch (error) {
      console.error("Error fetching student details:", error);
    }
  };

  const [search, setSearch] = useState<Search[] | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSubmit = async (values: any): Promise<void> => {
    try {
      const result = await axios.get(
        `http://localhost:8080/user?keyword=${values.search}`
      );
      console.log(result.data);
      setSearch(result.data);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  };
  return (
    <>
      {!auth.isLoading && (
        <div
          style={{
            background: "rgba( 0, 0, 0, 0.3 )",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
          ref={dropdownRef}
          className="sticky top-0 z-10 mx-auto flex h-[45px] w-full flex-row items-center justify-between md:h-[50px] pl-3 pr-3 font-noto "
        >
          <button className="flex flex-row" onClick={handleDashboard()}>
            {/* <Image className="mr-1" src={PSUlogo} height={60} width={60} alt="" /> */}
            <span className="text-md font-bold text-white md:text-lg lg:text-2xl justify-center flex my-auto">
              Schedule UP
            </span>
          </button>
          <div className="w-6/12">
            <Formik
              initialValues={{ search: "" }}
              onSubmit={handleSubmit}
              enableReinitialize={true}
            >
              {({ values, setFieldValue, submitForm }) => (
                <Form>
                  <div className="relative">
                    <div className="flex flex-row items-center border-2 border-Grey-500 h-[32px] rounded-[5px] bg-white px-2 justify-start my-auto">
                      
                      <Field
                        type="text"
                        name="search"
                        className="focus:outline-none w-full text-Green-500"
                        placeholder="ค้นหาผู้ใช้งานบน ScheduleUP"
                        value={values.search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setFieldValue("search", e.target.value);
                          submitForm();
                          setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(false)}
                      />
                      <button type="submit">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="grey"
                        className="bi bi-search my-auto mr-3"
                        viewBox="0 0 16 16"
                      >
                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                      </svg>
                      </button>
                    </div>
                    {showDropdown && (
                      <div className="absolute top-full left-0 mt-1 bg-white w-full border border-gray-300 rounded shadow-lg">
                        {search ? (
                          <div>
                            {search.map((item, index) => (
                              <div
                                key={index}
                                className="p-2 hover:bg-gray-100"
                              >
                                <Search
                                  studNameThai={item.studNameThai}
                                  studSnameThai={item.studSnameThai}
                                  studentId={item.studentId}
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div></div>
                        )}
                      </div>
                    )}
                  </div>
                </Form>
              )}
            </Formik>
          </div>
          <div>
            <div className="space-y-6" ref={dropdownRef}>
              <div className="flex items-center space-x-4">
                <div>
                  <button
                    title="bookmark=button"
                    className="text-md font-semibold md:text-md lg:text-2xl text-Green-500 h-[32px] px-3 items-center bg-white rounded-lg relative inline-block"
                    onClick={() => {
                      handleToggleBookmarkDropdown();
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2.5"
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                      />
                    </svg>
                  </button>
                  {/* </div> */}
                  {toggleBookmardDropdownn ? (
                    <>
                      <div className="absolute top-9 right-[360px] z-20 mt-2 rounded-lg bg-white shadow-xl dark:bg-gray-800  w-[380px] min-h-[60px] flex   items-center">
                        <a className="flex flex-col space-y-4 transform w-full p-3 text-sm capitalize text-Green-500">
                          {studentDetail?.bookMark.length != 0 ? (
                            <div>
                              {studentDetail?.bookMark.map((e) => {
                                return (
                                  <Bookmark
                                    key={e.scheduleId}
                                    scheduleName={e.scheduleName}
                                    scheduleId={e.scheduleId}
                                    reloadBookmarks={reloadBookmarks}
                                  />
                                );
                              })}
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              ไม่มี Bookmark ในขณะนี้{" "}
                            </div>
                          )}
                        </a>
                      </div>
                    </>
                  ) : null}
                </div>
                <button
                  title="create-button"
                  className="flex text-md font-semibold md:text-md lg:text-2xl text-gray-600 h-[32px] px-3 items-center bg-white rounded-lg"
                  onClick={() => {
                    handleCreate();
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </button>

                <div className="flex text-md font-medium md:text-md lg:text-lg text-gray-600 h-[32px] px-3 items-center bg-white rounded-lg">
                  {studentDetail?.studNameThai} {studentDetail?.studSnameThai}
                  {/* Hi! John@example.com */}
                </div>

                <div className="relative inline-block" ref={dropdownRef}>
                  <button
                    title="profile-button"
                    className="size-8 relative aspect-square"
                    onClick={() => {
                      handleToggleProfileDropdown();
                    }}
                  >
                    {studentDetail?.pictureBase64 && auth.user ? (
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
                  </button>
                  {toggleProfileDropdown ? (
                    <>
                      <div className="absolute right-0 z-20 mt-2 w-auto origin-top-right rounded-lg bg-white shadow-xl dark:bg-gray-800">
                        <button
                          className="flex transform items-center px-3 py-3 text-sm capitalize text-gray-600 transition-colors duration-0 hover:rounded-t-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                          onClick={handleRoute()}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="mx-1 h-5 w-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                            />
                          </svg>

                          <span className="mx-1">Profile</span>
                        </button>

                        <button
                          onClick={async () => {
                            await auth.signoutSilent(); // setStudentDetail(null);
                            router.push("/");
                          }}
                          className="flex transform items-center p-3 text-sm capitalize text-gray-600 transition-colors duration-0 hover:bg-gray-100 hover:rounded-b-lg dark:text-gray-300 dark:hover:bg-red-700 dark:hover:text-white"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="mx-1 h-5 w-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
                            />
                          </svg>

                          <span className="mx-1">Logout</span>
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavigationBar;
