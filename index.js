import fetch from "node-fetch";

const sendTextMessage = async (text) => {
  const body = {
    action: "SEND",
    textword: "3675563",
    contact: "792460867",
    body: text,
  };

  const response = await fetch("https://api.slicktext.com/v1/messages/", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(
        "pub_d7118c5b1634998476a0cfcc4582036f:a92aee0c6163ee9304c2cb23f586e3b6"
      )}`,
    },
  });
  const json = await response.json();
  console.log(json);
  return json;
};

const getCampgroundData = async (campgroundId) => {
  const response = await fetch(
    `https://www.recreation.gov/api/camps/campgrounds/${campgroundId}`
  );
  const { campground } = await response.json();
  return campground;
};

const getCampsiteAvailability = async (campgroundId) => {
  const response = await fetch(
    `https://www.recreation.gov/api/camps/availability/campground/${campgroundId}/month?start_date=2023-06-01T00%3A00%3A00.000Z`
  );
  const { campsites } = await response.json();
  return campsites;
};

const findAvailableSitesByCampground = async (campgroundId, dateString) => {
  const campsites = await getCampsiteAvailability(campgroundId);
  const availableCampsites = [];
  for (const campsiteId in campsites) {
    const campsite = campsites[campsiteId];
    if (campsite?.campsite_type === "MANAGEMENT") continue;
    const availability = campsite.availabilities[dateString];

    if (availability?.toLowerCase() === "available") {
      availableCampsites.push(campsite.site);
    }
  }
  return availableCampsites;
};

const findAvailableCampsites = async () => {
  console.log("Checking campsites...");
  console.log("---------------");
  const searchMap = {
    247592: "2023-06-26T00:00:00Z",
  };
  const campgroundIds = ["247592"];
  for (const campgroundId of campgroundIds) {
    const dateString = searchMap[campgroundId];
    const { facility_name: campgroundName } = await getCampgroundData(
      campgroundId
    );
    const campgroundNameFormatted = campgroundName
      .toLowerCase()
      .replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());
    const availableCampsites = await findAvailableSitesByCampground(
      campgroundId,
      dateString
    );
    console.log(`${campgroundNameFormatted}: `);
    if (availableCampsites.length) {
      console.log(`Available campsites: ${availableCampsites.join(", ")}`);
      sendTextMessage(
        `Campsite(s) available at ${campgroundNameFormatted}: ${availableCampsites.join(
          ", "
        )}`
      );
    } else {
      console.log(`No available campsites for ${dateString}`);
    }
    console.log("---------------");
  }
};

findAvailableCampsites();
