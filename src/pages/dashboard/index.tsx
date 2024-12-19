import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { useRouter } from "next/router";
import NavigationBar from "@/components/NavBar";

const Dashboard = () => {
  const auth = useAuth();
  const router = useRouter();

  const [studentDetail, setStudentDetail] = useState(null);

  useEffect(() => {
    const fetchStudentDetail = async () => {
      try {
        const result = await axios.get(
          `https://api-gateway.psu.ac.th/Test/regist/level2/StudentDetail/token`,
          {
            headers: {
              credential: "api_key=ARdj9JMA3UHQLwABr+Vv5JfuJCBZXr81",
              token: auth.user?.access_token,
            },
          }
        );
        setStudentDetail(result.data.data[0]);
      } catch (error) {
        console.error("Error fetching student details:", error);
      }
    };
    if (auth.isAuthenticated && auth.user) {
      fetchStudentDetail();
    }
  }, [auth.isAuthenticated, auth.user, setStudentDetail]);

  return (
    <div>
      {auth.isAuthenticated ? (
        <div>
          <NavigationBar />
          <button onClick={() => console.log(studentDetail)}>GET</button>
        </div>
      ) : null}
    </div>
  );
};

export default Dashboard;
