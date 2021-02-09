import buildClient from "../api/build-client";
const LandingPage = ({ currentUser }) => {
  console.log("user: ", currentUser);
  return currentUser ? (
    <h1>You are signed in</h1>
  ) : (
    <h1>You are NOT signed in!!!</h1>
  );
};

LandingPage.getInitialProps = async (context) => {
  const client = buildClient(context),
    { data } = await client.get("/api/users/currentuser");
  console.log(data);
  return data;
};
export default LandingPage;
