import LinkDetails from "@/components/LinkDetails";
import { useGetLink } from "@linkwarden/router/links";
import { useRouter } from "next/router";
import { useEffect } from "react";
import getServerSideProps from "@/lib/client/getServerSideProps";

const Index = () => {
  const router = useRouter();
  const { id } = router.query;

  let isPublicRoute = router.pathname.startsWith("/public") ? true : undefined;

  const getLink = useGetLink(isPublicRoute);

  useEffect(() => {
    getLink.mutate({ id: Number(id) });
  }, []);

  return (
    <div className="flex h-screen">
      {getLink.data ? (
        <LinkDetails
          activeLink={getLink.data}
          className="sm:max-w-xl sm:m-auto sm:p-5 w-full"
          standalone
        />
      ) : (
        <div className="max-w-xl p-5 m-auto w-full flex flex-col items-center gap-5">
          <div className="w-20 h-20 skeleton rounded-xl"></div>
          <div className="w-full h-10 skeleton rounded-xl"></div>
          <div className="w-full h-10 skeleton rounded-xl"></div>
          <div className="w-full h-10 skeleton rounded-xl"></div>
          <div className="w-full h-10 skeleton rounded-xl"></div>
        </div>
      )}
    </div>
  );
};

export default Index;

export { getServerSideProps };
