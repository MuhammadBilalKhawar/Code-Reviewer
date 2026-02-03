import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../utils/axiosConfig.js";
import { Container, Flex, Spinner, Card, CardContent } from "../components/ui";

export default function AuthSuccess() {
  const navigate = useNavigate();
  const { search } = useLocation();

  useEffect(() => {
    const authenticate = async () => {
      try {
        const params = new URLSearchParams(search);
        const token = params.get("token");

        if (!token) {
          navigate("/", { replace: true });
          return;
        }

        localStorage.setItem("token", token);

        const userRes = await api.get(`/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        localStorage.setItem("user", JSON.stringify(userRes.data));
        setTimeout(() => navigate("/dashboard", { replace: true }), 1200);
      } catch (err) {
        console.error("Authentication failed", err);
        localStorage.removeItem("token");
        navigate("/", { replace: true });
      }
    };

    authenticate();
  }, [search, navigate]);

  return (
    <div className="min-h-screen bg-carbon">
      <Container className="py-20">
        <Flex direction="col" align="center" justify="center">
          <Card className="max-w-md w-full">
            <CardContent className="py-16 text-center">
              <Spinner size="lg" />
              <h1 className="text-3xl font-bold mt-6" style={{ color: "#E8F1EE" }}>
                Welcome!
              </h1>
              <p className="mt-3" style={{ color: "#9DBFB7" }}>
                Authenticating your account...
              </p>
              <p className="text-sm mt-1" style={{ color: "#9DBFB7" }}>
                Redirecting to dashboard
              </p>
            </CardContent>
          </Card>
        </Flex>
      </Container>
    </div>
  );
}
