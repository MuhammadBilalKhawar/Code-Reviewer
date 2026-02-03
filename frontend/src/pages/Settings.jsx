import React, { useEffect, useState } from "react";
import api from "../utils/axiosConfig.js";
import Layout from "../components/Layout";
import { Badge, Button, Card, CardContent, Container, Flex, Grid, Spinner } from "../components/ui";
import { useTheme } from "../context/ThemeContext";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/auth/me`);
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    const savedNotifications = localStorage.getItem("notifications") !== "false";
    setNotifications(savedNotifications);
  }, []);

  const handleNotificationsToggle = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    localStorage.setItem("notifications", newValue.toString());
  };

  if (loading) {
    return (
      <Layout>
        <Container className="py-20">
          <Flex direction="col" align="center">
            <Spinner size="lg" />
            <p className="mt-4" style={{ color: "#9DBFB7" }}>
              Loading settings...
            </p>
          </Flex>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container className="py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold" style={{ color: "#E8F1EE" }}>
            Settings
          </h1>
          <p className="mt-2" style={{ color: "#9DBFB7" }}>
            Configure your preferences and account
          </p>
        </div>
        <div className="space-y-8">
          <Card>
            <CardContent className="p-8">
              <Flex justify="between" align="center" className="mb-6">
                <h2 className="text-2xl font-bold" style={{ color: "#E8F1EE" }}>
                  Profile
                </h2>
                <Button variant="secondary">Edit Profile</Button>
              </Flex>
              <Flex gap={6} align="center">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-carbon-100 flex items-center justify-center">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold" style={{ color: "#E8F1EE" }}>
                      {user?.name?.charAt(0) || "U"}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: "#E8F1EE" }}>
                    {user?.name || "User"}
                  </h3>
                  <p style={{ color: "#9DBFB7" }}>{user?.email || "No email"}</p>
                  <p className="text-sm mt-1" style={{ color: "#9DBFB7" }}>
                    Joined {new Date(user?.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                  </p>
                </div>
              </Flex>
            </CardContent>
          </Card>

          <Grid columns={1} gap={8}>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4" style={{ color: "#E8F1EE" }}>
                  Notifications
                </h2>
                <p className="text-sm mb-4" style={{ color: "#9DBFB7" }}>
                  Receive updates about reviews and testing
                </p>
                <Button
                  variant={notifications ? "primary" : "secondary"}
                  onClick={handleNotificationsToggle}
                >
                  {notifications ? "Enabled" : "Disabled"}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4" style={{ color: "#E8F1EE" }}>
                Danger Zone
              </h2>
              <p className="text-sm mb-4" style={{ color: "#9DBFB7" }}>
                Manage your session and security
              </p>
              <Button variant="danger">Sign Out</Button>
            </CardContent>
          </Card>
        </div>
      </Container>
    </Layout>
  );
}
