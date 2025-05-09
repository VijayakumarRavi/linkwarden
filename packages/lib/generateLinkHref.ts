import {
  AccountSettings,
  ArchivedFormat,
  LinkIncludingShortenedCollectionAndTags,
} from "@linkwarden/types";
import { LinksRouteTo } from "@linkwarden/prisma/client";
import { formatAvailable } from "@linkwarden/lib/formatStats";

export const generateLinkHref = (
  link: LinkIncludingShortenedCollectionAndTags,
  account: AccountSettings,
  instanceURL: string | null = "",
  apiEndpoint: boolean = false
): string => {
  // Return the links href based on the account's preference
  // If the user's preference is not available, return the original link

  let endpoint = "/preserved";
  if (apiEndpoint) {
    endpoint = "/api/v1/archives";
  }

  if (account.linksRouteTo === LinksRouteTo.ORIGINAL && link.type === "url") {
    return link.url || "";
  } else if (account.linksRouteTo === LinksRouteTo.PDF || link.type === "pdf") {
    if (!formatAvailable(link, "pdf")) return link.url || "";

    return instanceURL + `${endpoint}/${link?.id}?format=${ArchivedFormat.pdf}`;
  } else if (
    account.linksRouteTo === LinksRouteTo.READABLE &&
    link.type === "url"
  ) {
    if (!formatAvailable(link, "readable")) return link.url || "";

    return (
      instanceURL +
      `${endpoint}/${link?.id}?format=${ArchivedFormat.readability}`
    );
  } else if (
    account.linksRouteTo === LinksRouteTo.SCREENSHOT ||
    link.type === "image"
  ) {
    if (!formatAvailable(link, "image")) return link.url || "";

    return (
      instanceURL +
      `${endpoint}/${link?.id}?format=${
        link?.image?.endsWith("png") ? ArchivedFormat.png : ArchivedFormat.jpeg
      }`
    );
  } else if (account.linksRouteTo === LinksRouteTo.MONOLITH) {
    if (!formatAvailable(link, "monolith")) return link.url || "";

    return (
      instanceURL + `${endpoint}/${link?.id}?format=${ArchivedFormat.monolith}`
    );
  } else {
    return link.url || "";
  }
};
