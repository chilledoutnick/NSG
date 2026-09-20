import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner";
import { LazyLoadImage } from "react-lazy-load-image-component";
import copy from "copy-to-clipboard";
import moment from "moment";
import Swal from "sweetalert2";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import { styled } from "@mui/material/styles";
import ArchiveIcon from "@mui/icons-material/ArchiveOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CheckIcon from "@mui/icons-material/Check";
import CallIcon from "@mui/icons-material/CallOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import EditNoteIcon from "@mui/icons-material/EditNote";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import TodayIcon from "@mui/icons-material/Today";
import EventIcon from "@mui/icons-material/Event";
// import FilterAltTwoToneIcon from "@mui/icons-material/FilterAltTwoTone";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import AddIcon from "@mui/icons-material/Add";
import ShareIcon from "@mui/icons-material/Share";
import EditIcon from "@mui/icons-material/EditOutlined";
import SaveIcon from "@mui/icons-material/SaveAsOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CakeOutlined from "@mui/icons-material/CabinOutlined";
import HomeOutlined from "@mui/icons-material/HomeOutlined";
import AccountCircleIcon from "@mui/icons-material/AccountCircleOutlined";
import BusinessIcon from "@mui/icons-material/Business";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import BottomBar from "../../Components/CardProfileBottomBar/BottomBar";
import BlurPopup from "../../Components/BlurPopup/BlurPopup";
import Toast from "../../Components/Toast/Toast";
import Timeline from "./Timeline/Timeline";
import BookingIntegration from "../../Components/BookingIntegration/BookingIntegration";
import AddContact from "../../Components/AddContact/AddContact";
import NoteAndReminder from "../../Components/NoteAndReminder/NoteAndReminder";
import SendEmail from "../../Components/SendEmail/SendEmail";
import SaveToPhone from "../../Components/SaveToPhone/SaveToPhone";
import UserUploadPage from "../../Components/UploadUsers/UploadUsers";
import BusinessCardScanner from "../../Components/BusinessCardScanner/BusinessCardScanner";
import "./People.scss";
import "./PeopleDetails.scss";
import "./PeopleRes.scss";

const no_people_img =
  "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/peoplepng_png.webp";

const defaultPotentialTagList = [
  { name: "Client", color: "#58c4dd" },
  { name: "Prospect", color: "#c89b40" },
  { name: "Potential Partner", color: "#6b5cff" },
  { name: "Advisor/Mentor", color: "#c6856a" },
];

function People() {
  const timeoutRef = useRef();
  const isLongPress = useRef();
  const windowWidth = useRef(window.innerWidth);
  let isMobile = windowWidth.current < 1200 ? true : false;
  const isCompactMobile = windowWidth.current < 700;
  const [checkAll, setCheckAll] = useState(false);
  const [sortByDate, setSortByDate] = useState(false);
  const [sortByName, setSortByName] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [isArchivingContact, setIsArchivingContact] = useState(false);
  const [showConfirmArchived, setShowConfirmArchived] = useState(false);
  const [showMenuPopup, setShowMenuPopup] = useState(false);
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [showBooking, setShowBooking] = useState(false);
  const [showSendEmail, setShowSendEmail] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showNoteReminder, setShowNoteReminder] = useState(false);
  const [showSaveToPhone, setShowSaveToPhone] = useState(false);
  const [showBusinessCardScanner, setShowBusinessCardScanner] = useState(false);
  const [MobileData, setMobileData] = useState({});
  const [contactList, setContactList] = useState([]);
  const [archiveContactList, setArchiveContactList] = useState([]);
  const [archiveContactListMobile, setArchiveContactListMobile] = useState({});
  const [potentialContactList, setPotentialContactList] = useState([]);
  const [potentialContactListMobile, setPotentialContactListMobile] = useState(
    {},
  );
  const [isAbout, setIsAbout] = useState(false);
  const [isEditContact, setIsEditContact] = useState(false);
  const [isUserDetailsMenu, setIsUserDetailsMenu] = useState(false);
  const [ContactDetails, setContactDetails] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isShowArchived, setIsShowArchived] = useState(false);
  const [isShowPotential, setIsShowPotential] = useState(false);
  const [currentLimit, setCurrentLimit] = useState(15);
  const [contactCliked, setContactCliked] = useState(false);
  const [callInitiated, setCallInitiated] = useState(false);
  const [noteAdded, setNoteAdded] = useState(false);
  const [importContacts, setImportContacts] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scannerInitialData, setScannerInitialData] = useState(null);
  // ─── TAG MODAL STATE ───────────────────────────────────────────────────────
  const [showTagModal, setShowTagModal] = useState(false);
  const [tagModalTagList, setTagModalTagList] = useState([]);
  const [tagModalSelected, setTagModalSelected] = useState([]);
  const [tagModalLoading, setTagModalLoading] = useState(false);
  const [tagModalSaving, setTagModalSaving] = useState(false);
  const [showCreateTagInModal, setShowCreateTagInModal] = useState(false);
  const [newTagData, setNewTagData] = useState({ tag: "" });
  const [showPotentialTagModal, setShowPotentialTagModal] = useState(false);
  const [potentialTagModalTagList, setPotentialTagModalTagList] = useState([]);
  const [potentialTagModalSelected, setPotentialTagModalSelected] = useState(
    [],
  );
  const [potentialTagModalLoading, setPotentialTagModalLoading] =
    useState(false);
  const [potentialTagModalSaving, setPotentialTagModalSaving] = useState(false);

  // ──────────────────────────────────────────────────────────────────────────
  const showMobilePeopleDetails = isMobile
    ? contactCliked
      ? true
      : false
    : true;

  // ─── SEARCH & FILTER STATE ─────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilters, setSearchFilters] = useState({
    priority: "",
    company: "",
    tag: "",
  });
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [searchTotal, setSearchTotal] = useState(0);
  const searchDebounceRef = useRef(null);
  const filterPanelRef = useRef(null);
  // ──────────────────────────────────────────────────────────────────────────

  const [ToastText, setToastText] = useState({
    text: "",
    show: false,
  });
  const { publicIdSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const previousPathRef = useRef(location.pathname);

  const CustomTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: "#5B5574",
      color: "#FFF",
      fontSize: "12px",
      padding: "8px",
      borderRadius: "4px",
      fontFamily: "'Open Sans', sans-serif",
    },
    [`& .${tooltipClasses.arrow}`]: {
      color: "#5B5574",
    },
  }));

  const no_data_guide = [
    {
      title: "Business cards",
      img: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Icon_filler_png.webp",
    },
    {
      title: "Scan QR code",
      img: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Icon_filler_1_png.webp",
    },
    {
      title: "Manually add",
      img: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Icon_filler_2_png.webp",
    },
    {
      title: "Link share",
      img: "https://storage.googleapis.com/nsg-db-storage-public/media/webp_images/Icon_filler_3_png.webp",
    },
  ];

  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
  };

  const parseArrayField = (value) => {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }
    return [];
  };

  const normalizeTagList = (rawTags = []) =>
    rawTags
      .map((tag) => {
        if (typeof tag === "string") {
          return { name: tag, color: "#6b5cff" };
        }
        if (!tag?.name && !tag?.tag) return null;
        return {
          name: tag.name || tag.tag,
          color: tag.color || "#6b5cff",
        };
      })
      .filter(Boolean);

  const getTagResponseList = (responseData) => {
    if (Array.isArray(responseData)) return responseData;
    if (Array.isArray(responseData?.data)) return responseData.data;
    if (Array.isArray(responseData?.tags)) return responseData.tags;
    if (Array.isArray(responseData?.results)) return responseData.results;
    if (Array.isArray(responseData?.potential_tags)) return responseData.potential_tags;
    return [];
  };

  const normalizePotentialContact = (contact = {}) => {
    const socialLinks = parseArrayField(contact.social_links);
    const normalizedTags = normalizeTagList(contact.tags);
    const potentialContactId =
      contact.potential_contact_id ||
      contact.contact_id ||
      contact.id ||
      contact.contact?.potential_contact_id ||
      contact.contact?.contact_id;
    const primaryTag =
      normalizedTags.length > 0
        ? normalizedTags
        : [{ name: "Potential Contact", color: "#6b5cff" }];

    return {
      ...contact,
      potential_contact_id: potentialContactId,
      contact_id: potentialContactId,
      contact_url: contact.contact_url || "/people",
      name: contact.name || contact.full_name || contact.contact?.name || "NA",
      email:
        contact.email || contact.primary_email || contact.contact?.email || "",
      phone:
        contact.phone || contact.mobile || contact.contact?.phone || "",
      additional_email: contact.additional_email || "",
      additional_phone: contact.additional_phone || "",
      designation: contact.designation || "",
      company: contact.company || "",
      address: contact.address || "",
      about: contact.about || contact.note || "",
      birthday: contact.birthday || "",
      social_links: socialLinks,
      tags: primaryTag,
      priority: contact.priority || "Medium",
      upcoming: contact.upcoming || "Nothing yet",
      image: contact.image || contact.profile_picture || "",
      is_profile_pic: Boolean(contact.is_profile_pic),
      image_color: contact.image_color || "#6B5CFF",
      date_added:
        contact.date_added ||
        contact.created_at ||
        contact.timestamp ||
        new Date().toISOString(),
      isPotentialMock: true,
    };
  };

  const getPotentialResponseList = (responseData) => {
    if (Array.isArray(responseData)) return responseData;
    if (Array.isArray(responseData?.data)) return responseData.data;
    if (Array.isArray(responseData?.results)) return responseData.results;
    if (Array.isArray(responseData?.contacts)) return responseData.contacts;
    if (Array.isArray(responseData?.potential_contacts))
      return responseData.potential_contacts;
    return [];
  };

  const postWithFallback = async (url, payloadOptions = [{}]) => {
    let lastError;

    for (const payload of payloadOptions) {
      try {
        const response = await axios.post(url, payload, config);
        return response;
      } catch (error) {
        lastError = error;
        const status = error?.response?.status;
        if (status && status !== 400 && status !== 404) {
          break;
        }
      }
    }

    throw lastError;
  };

  // ─── SEARCH & FILTER LOGIC ─────────────────────────────────────────────────

  const activeFilterCount = Object.values(searchFilters).filter(Boolean).length;

  // Close filter panel on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(e.target)
      ) {
        setFilterPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Trigger search whenever query or filters change (debounced)
  useEffect(() => {
    const hasQuery = searchQuery.trim().length > 0;
    const hasFilters = activeFilterCount > 0;

    if (!hasQuery && !hasFilters) {
      setIsSearchMode(false);
      setSearchResults([]);
      return;
    }

    setIsSearchMode(true);
    setIsSearching(true);

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    searchDebounceRef.current = setTimeout(() => {
      performSearch();
    }, 350);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery, searchFilters]);

  const performSearch = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      if (searchFilters.priority)
        params.append("priority", searchFilters.priority);
      if (searchFilters.company)
        params.append("company", searchFilters.company);
      if (searchFilters.tag) params.append("tag", searchFilters.tag);
      params.append("limit", "50");
      params.append("offset", "0");

      const response = await axios.get(
        `/api/contact/search_contacts/?${params.toString()}`,
        config,
      );
      setSearchResults(response.data.results || response.data);
      setSearchTotal(
        response.data.count || (response.data.results || response.data).length,
      );
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchFilters({ priority: "", company: "", tag: "" });
    setIsSearchMode(false);
    setSearchResults([]);
    setFilterPanelOpen(false);
  };

  // ─── TAG MODAL LOGIC ───────────────────────────────────────────────────────
  const openTagModal = () => {
    // Pre-select contact's current tags
    // ✅ contactList se fresh data lo
    const freshPerson = contactList.find(
      (c) => c.contact_id === selectedPeople[0]?.contact_id,
    );
    const currentTags =
      freshPerson?.tags?.map((t) => t.name) ||
      selectedPeople[0]?.tags?.map((t) => t.name) ||
      [];

    setTagModalSelected(currentTags);
    setTagModalSelected(currentTags);
    setShowCreateTagInModal(false);
    setNewTagData({ tag: "" });
    setTagModalLoading(true);
    setShowTagModal(true);

    axios
      .post("api/contact/get_tags/", {}, config)
      .then((res) => {
        setTagModalTagList(res.data.data);
        setTagModalLoading(false);
      })
      .catch(() => setTagModalLoading(false));
  };

  const saveTagModal = () => {
    if (tagModalSaving) return;
    setTagModalSaving(true);

    const person = selectedPeople[0];
    const formData = new FormData();
    formData.append("contact_id", person.contact_id);
    formData.append("name", person.name);
    formData.append("email", person.email || "");
    formData.append("phone", person.phone || "");
    formData.append("is_profile_pic", person.is_profile_pic || false);
    formData.append("birthday", person.birthday || "");
    formData.append("address", person.address || "");
    formData.append("about", person.about || "");
    formData.append("designation", person.designation || "");
    formData.append("company", person.company || "");
    formData.append("priority", person.priority || "Medium");
    formData.append("additional_email", person.additional_email || "");
    formData.append("additional_phone", person.additional_phone || "");
    formData.append("social_links", person.social_links || "");
    formData.append("pictures", "");
    // ✅ System tags filter karke bhejo
    const tagsToSend = tagModalSelected.filter(
      (t) => t !== "Manually Added" && t !== "Business Card",
    );
    formData.append("tags", tagsToSend.join(","));

    axios
      .post("api/contact/update_contact/", formData, config)
      .then((res) => {
        const updated = res.data.data[0];
        handleUpdateContact(updated);
        setShowTagModal(false);
        setTagModalSaving(false);
        setToastText({ text: "Tags updated!", show: true });
      })
      .catch((err) => {
        setTagModalSaving(false);
        Swal.fire({
          icon: "warning",
          title: "Something went wrong",
          text: err?.response?.data?.message || "Please try again",
          showConfirmButton: false,
          timer: 3000,
        });
      });
  };

  const addTagInModal = () => {
    if (!newTagData.tag) return;
    axios
      .post("api/contact/add_tag/", newTagData, config)
      .then(() => {
        // Refresh tag list
        axios.post("api/contact/get_tags/", {}, config).then((res) => {
          setTagModalTagList(res.data.data);
          setShowCreateTagInModal(false);
          setNewTagData({ tag: "" });
        });
      })
      .catch((err) => {
        Swal.fire({
          icon: "warning",
          title: "Something went wrong",
          text: err?.response?.data?.message,
          showConfirmButton: false,
          timer: 3000,
        });
      });
  };
  // ──────────────────────────────────────────────────────────────────────────

  const clearOneFilter = (key) => {
    setSearchFilters((prev) => ({ ...prev, [key]: "" }));
  };

  // ──────────────────────────────────────────────────────────────────────────

  const handleTimelineRefresh = () => {
    setNoteAdded(!noteAdded);
  };

  const isSamePerson = (firstPerson, secondPerson) =>
    firstPerson?.contact_id === secondPerson?.contact_id;

  const isPersonSelected = (person, people = selectedPeople) =>
    people.some((selectedPerson) => isSamePerson(selectedPerson, person));

  const handlePersonClick = (person) => {
    const isSelected = isPersonSelected(person);
    if (isSelected) {
      setSelectedPeople((prevSelectedPeople) =>
        prevSelectedPeople.map((selectedPerson) =>
          isSamePerson(selectedPerson, person) ? person : selectedPerson,
        ),
      );
    } else {
      setSelectedPeople((prevSelectedPeople) => [
        ...prevSelectedPeople,
        person,
      ]);
    }
  };

  const handlePersonSelect = (person) => {
    setSelectedPeople((prevSelectedPeople) => {
      const isSelected = isPersonSelected(person, prevSelectedPeople);
      if (isSelected) {
        return prevSelectedPeople.filter(
          (selectedPerson) => !isSamePerson(selectedPerson, person),
        );
      } else {
        return [...prevSelectedPeople, person];
      }
    });
  };

  const handleClick = (person) => {
    if (!isLongPress.current) {
      setContactCliked(true);
      handlePersonClick(person);
    }
  };

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLongPressStart = (person) => {
    isLongPress.current = false;
    timeoutRef.current = setTimeout(() => {
      isLongPress.current = true;
      handlePersonSelect(person);
    }, 400);
  };

  const handleLongPressEnd = () => {
    clearTimeout(timeoutRef.current);
  };

  const handleMouseDown = (person) => {
    handleLongPressStart(person);
  };

  const handleMouseUp = (e) => {
    handleLongPressEnd();
    if (isLongPress.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  useEffect(() => {
    if (publicIdSlug && selectedPeople.length === 0) return;

    if (selectedPeople.length === 1) {
      const targetUrl = selectedPeople[0].contact_url || "/people";
      if (window.location.pathname !== targetUrl) {
        window.history.pushState({ path: targetUrl }, "", targetUrl);
      }
    } else {
      if (window.location.pathname !== "/people") {
        window.history.pushState({ path: "/people" }, "", "/people");
      }
    }
  }, [selectedPeople, publicIdSlug]);

  useEffect(() => {
    const previousPath = previousPathRef.current;
    const isEnteringPeopleRoot =
      location.pathname === "/people" && previousPath !== "/people";

    if (isEnteringPeopleRoot && !isShowArchived && !isShowPotential) {
      setSelectedPeople([]);
      setContactDetails([]);
      setContactCliked(false);
      setCheckAll(false);
      setIsAbout(false);
    }

    previousPathRef.current = location.pathname;
  }, [location.pathname, isShowArchived, isShowPotential]);

  useEffect(() => {
    console.log("Updated selectedPeople:", selectedPeople);
    if (
      selectedPeople.length === 1 &&
      selectedPeople[0]?.contact_id &&
      !selectedPeople[0]?.isPotentialMock &&
      !selectedPeople[0]?.isLocalOnlyContact
    ) {
      get_contact_data(selectedPeople[0].contact_id);
    } else if (
      selectedPeople.length === 1 &&
      (selectedPeople[0]?.isPotentialMock ||
        selectedPeople[0]?.isLocalOnlyContact)
    ) {
      setContactDetails(selectedPeople[0]);
    }
  }, [selectedPeople]);

  useEffect(() => {
    if (!publicIdSlug) return;
    if (!localStorage.getItem("jwt")) {
      localStorage.setItem(
        "post_login_redirect",
        window.location.pathname + window.location.search,
      );
      navigate("/login");
      return;
    }
    axios
      .get(`/api/contact/${publicIdSlug}/`, config)
      .then((res) => {
        setContactDetails(res.data);

        setContactCliked(true);
        if (res.data.is_archived) {
          setIsShowArchived(true);
        }

        const contactId = res.data.contact_id;
        axios
          .post(
            "api/contact/get_contact_data/",
            { contact_id: contactId },
            config,
          )
          .then((detailRes) => {
            // get_contact_data returns detail; we need list-shape for selectedPeople
            // Use res.data but ensure tags come from the detail response
            const merged = {
              ...res.data,
              tags: detailRes.data?.tags || res.data?.tags || [],
            };
            setSelectedPeople([merged]);
          });
      })
      .catch((err) => {
        const status = err?.response?.status;

        if (status === 401) {
          localStorage.setItem(
            "post_login_redirect",
            window.location.pathname + window.location.search,
          );
          navigate("/login");
          return;
        }

        if (status === 403 || status === 404) {
          Swal.fire({
            icon: "error",
            title: "Contact not found",
            text: "This contact is not available",
          });
          navigate("/people");
          return;
        }
        Swal.fire({
          icon: "error",
          title: "Something went wrong",
          text: "Please try again later",
        });
      });
  }, [publicIdSlug]);
  useEffect(() => {
    if (selectedPeople.length === 1 && contactList.length > 0) {
      const fromList = contactList.find(
        (c) => c.contact_id === selectedPeople[0]?.contact_id,
      );
      if (
        fromList &&
        JSON.stringify(fromList.tags) !==
          JSON.stringify(selectedPeople[0]?.tags)
      ) {
        setSelectedPeople([{ ...selectedPeople[0], ...fromList }]);
      }
    }
  }, [contactList]);

  useEffect(() => {
    let showAddContact = window.location.hash;
    if (showAddContact === "#add_contact") {
      setShowAddContact(true);
      window.history.pushState({}, "", "/people");
    }
    if (showAddContact === "#show_email") {
      setShowSendEmail(true);
      window.history.pushState({}, "", "/people");
    }
    const url = window.location.href.split("?");
    if (url[1] !== undefined) {
      setShowBooking(true);
    }
  }, []);

  useEffect(() => {
    if (isShowArchived) {
      archived_contact_log();
    }
  }, [isShowArchived]);

  useEffect(() => {
    if (isShowPotential) {
      potential_contact_log();
    }
  }, [isShowPotential]);

  const groupByDate = (data) => {
    return data.reduce((acc, item) => {
      const date = new Date(item["date_added"]).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {});
  };

  const clearSpecialViewSelection = () => {
    setSelectedPeople([]);
    setContactDetails([]);
    setContactCliked(false);
    setCheckAll(false);
    setIsAbout(false);
    if (window.location.pathname !== "/people") {
      navigate("/people");
    }
  };

  const archived_contact_log = () => {
    const url = "api/contact/archived_contact_log/";
    axios
      .post(url, {}, config)
      .then((res) => {
        setArchiveContactList(res.data);
        const newGroupedData = groupByDate(res.data);
        setArchiveContactListMobile(newGroupedData);
      })
      .catch((err) => console.log("res", err));
  };

  const potential_contact_log = async () => {
    setLoading(true);
    try {
      const response = await postWithFallback(
        "api/potential_contact/potential_contact_log/",
        [{}, { offset: 0, limit: 100 }],
      );
      const normalizedList = getPotentialResponseList(response.data).map(
        normalizePotentialContact,
      );

      setPotentialContactList(normalizedList);
      setPotentialContactListMobile(groupByDate(normalizedList));
      setCheckAll(false);
    } catch (err) {
      console.error("Error fetching potential contacts:", err);
      setPotentialContactList([]);
      setPotentialContactListMobile({});
      setSelectedPeople([]);
      setContactDetails([]);
      Swal.fire({
        icon: "warning",
        title: "Something went wrong",
        text:
          err?.response?.data?.message ||
          "Unable to fetch potential contacts right now.",
        showConfirmButton: false,
        timer: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const get_contact_data = async (contact_id) => {
    const url = "api/contact/get_contact_data/";
    const payload = { contact_id: contact_id };
    axios
      .post(url, payload, config)
      .then((res) => setContactDetails(res.data))
      .catch((err) => console.log("res", err));
  };

  const update_priority = (person, priority) => {
    const url = "api/contact/update_priority/";
    const payload = { contact_id: person.contact_id, priority: priority };
    axios
      .post(url, payload, config)
      .then(() => {
        setToastText({ ...ToastText, text: "Priority Updated", show: true });
        setContactList((prevList) => {
          const updatedList = [...prevList];
          const index = updatedList.findIndex(
            (contact) => contact.contact_id === person.contact_id,
          );
          if (index !== -1) {
            updatedList[index] = { ...updatedList[index], priority: priority };
          }
          return updatedList;
        });
      })
      .catch((err) => {
        Swal.fire({
          icon: "warning",
          title: "something went wrong",
          text: err.response.data.message,
          showConfirmButton: false,
          timer: 3000,
        });
      });
  };

  const get_contact_log = async () => {
    setLoading(true);
    const url = "/api/contact/contact_log/";
    const payload = { offset: offset, limit: currentLimit };
    try {
      const response = await axios.post(url, payload, config);
      const result = response.data;
      if (result.length === 0) {
        setHasMore(false);
        setLoading(false);
        return;
      }
      setContactList((prevData) => [...prevData, ...result]);
      const newGroupedData = groupByDate(result);
      setMobileData((prevGroupedData) => {
        const mergedData = { ...prevGroupedData };
        Object.keys(newGroupedData).forEach((date) => {
          if (!mergedData[date]) mergedData[date] = [];
          mergedData[date] = [...mergedData[date], ...newGroupedData[date]];
        });
        return mergedData;
      });

      setOffset((prevOffset) => prevOffset + result.length);

      setCurrentLimit(40);
    } catch (error) {
      console.error("Error fetching data:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasMore) {
      get_contact_log();
    }
  }, [offset, hasMore]);

  useEffect(() => {
    if (ToastText.show) {
      setTimeout(() => {
        setToastText({ ...ToastText, show: false });
      }, 3000);
    }
  }, [ToastText]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && callInitiated) {
        const timeAway = Date.now() - callStartTime.current;
        if (timeAway > 5000) {
          add_call_timeline();
        }
        setCallInitiated(false);
        callStartTime.current = null;
      }
    };
    const handleFallback = () => {
      if (callInitiated) {
        setTimeout(() => {
          add_call_timeline();
          setCallInitiated(false);
          callStartTime.current = null;
        }, 5000);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    handleFallback();
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [callInitiated]);

  const handleAddContact = (newLog) => {
    setContactList((prev) => [newLog, ...prev]);
    addContactMobile(newLog);
  };

  const handleUpdateContact = (newLog) => {
    setContactList((prev) => {
      const filteredList = prev.filter(
        (contact) => contact.contact_id !== newLog.contact_id,
      );
      return [newLog, ...filteredList];
    });
    updateContact(newLog);
    setSelectedPeople([newLog]);
  };

  const updateContact = (updatedContact) => {
    const { contact_id, date_added } = updatedContact;
    const dateKey = new Date(date_added).toDateString();
    setMobileData((prevData) => {
      const updatedDateArray = prevData[dateKey]?.map((contact) =>
        contact.contact_id === contact_id
          ? { ...contact, ...updatedContact }
          : contact,
      );
      if (updatedDateArray?.length === 0) {
        const { [dateKey]: _, ...rest } = prevData;
        return rest;
      }
      return { ...prevData, [dateKey]: updatedDateArray };
    });
  };

  const archive_contact = () => {
    setIsArchivingContact(true);
    let contact_ids = [];
    selectedPeople.map((item) => contact_ids.push(item.contact_id));
    const url = "api/contact/archive_contact/";
    const payload = { contact_id: contact_ids };
    axios
      .post(url, payload, config)
      .then(() => {
        setToastText({
          ...ToastText,
          text: "Successfully archived!",
          show: true,
        });
        setContactList((prev) =>
          prev.filter((item) => !contact_ids.includes(item.contact_id)),
        );
        selectedPeople.map((item) => removeContactMobile(item));
        setShowConfirmArchived(false);
        setSelectedPeople([]);
        setContactDetails([]);
        setContactCliked(false);
        setCheckAll(false);
        if (window.location.pathname !== "/people") {
          navigate("/people");
        }
      })
      .catch((err) => {
        Swal.fire({
          icon: "warning",
          title: "something went wrong",
          text: err.response.data.message,
          showConfirmButton: false,
          timer: 3000,
        });
      })
      .finally(() => {
        setIsArchivingContact(false);
      });
  };

  const delete_contact = () => {
    let contact_ids = [];
    selectedPeople.map((item) => contact_ids.push(item.contact_id));
    const url = "api/contact/delete_contact/";
    const payload = { contact_id: contact_ids };
    axios
      .post(url, payload, config)
      .then((res) => {
        clearSpecialViewSelection();
        archived_contact_log();
        setToastText({
          ...ToastText,
          text: "Permanently deleted contacts",
          show: true,
        });
      })
      .catch((err) =>
        Swal.fire({
          icon: "warning",
          title: "something went wrong",
          text: err.response.data.message,
          showConfirmButton: false,
          timer: 3000,
        }),
      );
  };

  const restore_contact = () => {
    const restoredContacts = [...selectedPeople];
    let contact_ids = [];
    restoredContacts.map((item) => contact_ids.push(item.contact_id));
    const url = "api/contact/restore_contact/";
    const payload = { contact_id: contact_ids };
    axios
      .post(url, payload, config)
      .then((res) => {
        setContactList((prev) => [...restoredContacts, ...prev]);
        restoredContacts.map((item) => addContactMobile(item));
        clearSpecialViewSelection();
        archived_contact_log();
        setToastText({ ...ToastText, text: "Restored contacts", show: true });
      })
      .catch((err) =>
        Swal.fire({
          icon: "warning",
          title: "something went wrong",
          text: err.response.data.message,
          showConfirmButton: false,
          timer: 3000,
        }),
      );
  };

  const removePotentialContact = (contactId) => {
    setPotentialContactList((prev) =>
      prev.filter((contact) => contact.contact_id !== contactId),
    );
    setPotentialContactListMobile((prevData) => {
      const updatedData = Object.entries(prevData).reduce(
        (acc, [date, items]) => {
          const filtered = items.filter(
            (contact) => contact.contact_id !== contactId,
          );
          if (filtered.length > 0) {
            acc[date] = filtered;
          }
          return acc;
        },
        {},
      );
      return updatedData;
    });
  };

  const removePotentialContacts = (contactIds = []) => {
    contactIds.forEach((contactId) => removePotentialContact(contactId));
  };

  const resetPotentialSelectionInList = () => {
    clearSpecialViewSelection();
  };

  const handleDeletePotential = () => {
    const potentialContacts = selectedPeople.filter((contact) => contact?.contact_id);
    if (potentialContacts.length === 0) return;

    setLoading(true);

    Promise.all(
      potentialContacts.map((contact) =>
        postWithFallback("api/potential_contact/delete_potential_contact/", [
          { contact_id: [contact.contact_id] },
          { contact_id: contact.contact_id },
          { potential_contact_id: contact.contact_id },
          { potential_contact_id: [contact.contact_id] },
        ]),
      ),
    )
      .then(() => {
        const potentialIds = potentialContacts.map((contact) => contact.contact_id);
        removePotentialContacts(potentialIds);
        resetPotentialSelectionInList(potentialIds);
        setToastText({
          text:
            potentialContacts.length > 1
              ? "Potential contacts deleted"
              : "Potential contact deleted",
          show: true,
        });
      })
      .catch((err) => {
        Swal.fire({
          icon: "warning",
          title: "Something went wrong",
          text: err?.response?.data?.message || "Unable to delete contact.",
          showConfirmButton: false,
          timer: 3000,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const openPotentialTagModal = () => {
    const activePotential = selectedPeople[0];
    if (!activePotential) return;

    setPotentialTagModalLoading(true);
    setPotentialTagModalSelected(
      activePotential.tags?.map((tag) => tag.name).slice(0, 3) || [],
    );
    setShowPotentialTagModal(true);

    axios
      .post("api/contact/get_tags/", {}, config)
      .then((res) => {
        const apiTagList = normalizeTagList(getTagResponseList(res.data));
        const currentTagList = normalizeTagList(activePotential.tags || []);
        const tagList = [...apiTagList, ...currentTagList, ...defaultPotentialTagList]
          .filter(
            (tag, index, arr) =>
              arr.findIndex((item) => item.name === tag.name) === index,
          );
        setPotentialTagModalTagList(
          tagList.length > 0 ? tagList : defaultPotentialTagList,
        );
        setPotentialTagModalLoading(false);
      })
      .catch(() => {
        setPotentialTagModalTagList(defaultPotentialTagList);
        setPotentialTagModalLoading(false);
      });
  };

  const savePotentialContactToPeople = () => {
    const potentialContacts = selectedPeople.filter((contact) => contact?.contact_id);
    if (potentialContacts.length === 0) return;

    setPotentialTagModalSaving(true);

    const selectedTags = potentialTagModalTagList
      .filter((tag) => potentialTagModalSelected.includes(tag.name))
      .map((tag) => tag.name);
    const selectedTagObjects = potentialTagModalTagList.filter((tag) =>
      potentialTagModalSelected.includes(tag.name),
    );

    Promise.all(
      potentialContacts.map((contact) =>
        postWithFallback("api/potential_contact/add_to_contact/", [
          { contact_id: contact.contact_id, tags: selectedTags },
          { contact_id: [contact.contact_id], tags: selectedTags },
          { potential_contact_id: contact.contact_id, tags: selectedTags },
          {
            potential_contact_id: contact.contact_id,
            tag: selectedTags.join(","),
          },
        ]).then((res) => ({ contact, res })),
      ),
    )
      .then((results) => {
        const movedContacts = results.map(({ contact, res }) => {
          const responseData = res.data?.data?.[0] || res.data?.data || res.data;
          const normalizedResponseTags = normalizeTagList(
            responseData?.tags ||
              responseData?.tag ||
              responseData?.contact_tags ||
              responseData?.contact?.tags ||
              [],
          );

          return {
            ...contact,
            ...(responseData?.contact || {}),
            ...responseData,
            tags:
              normalizedResponseTags.length > 0
                ? normalizedResponseTags
                : selectedTagObjects,
            isPotentialMock: false,
            isLocalOnlyContact: false,
            contact_url: "/people",
          };
        });

        const potentialIds = potentialContacts.map((contact) => contact.contact_id);
        removePotentialContacts(potentialIds);
        setContactList((prev) => [...movedContacts, ...prev]);
        movedContacts.forEach((contact) => addContactMobile(contact));
        setShowPotentialTagModal(false);
        setPotentialTagModalSaving(false);
        resetPotentialSelectionInList(potentialIds);
        setToastText({
          text:
            movedContacts.length > 1
              ? "Added contacts to main list"
              : "Added to contacts",
          show: true,
        });
      })
      .catch((err) => {
        setPotentialTagModalSaving(false);
        Swal.fire({
          icon: "warning",
          title: "Something went wrong",
          text:
            err?.response?.data?.message ||
            "Unable to add this potential contact.",
          showConfirmButton: false,
          timer: 3000,
        });
      });
  };

  const addContactMobile = (newContact) => {
    const dateKey = new Date(newContact.date_added).toDateString();
    setMobileData((prevData) => ({
      ...prevData,
      [dateKey]: [newContact, ...(prevData[dateKey] || [])],
    }));
  };

  const removeContactMobile = (contactData) => {
    const { contact_id, date_added } = contactData;
    const dateKey = new Date(date_added).toDateString();
    setMobileData((prevData) => {
      const updatedDateArray = prevData[dateKey]?.filter(
        (contact) => contact.contact_id !== contact_id,
      );
      if (updatedDateArray?.length === 0) {
        const { [dateKey]: _, ...rest } = prevData;
        return rest;
      }
      return { ...prevData, [dateKey]: updatedDateArray };
    });
  };

  const handleShareClick = () => {
    const shareText = `\nName: ${selectedPeople[0].name}\nPhone: ${selectedPeople[0].phone}\nEmail: ${selectedPeople[0].email}\n`;
    const customShareUrl = "/";
    if (navigator.share && customShareUrl) {
      try {
        navigator.share({ title: selectedPeople[0].name, text: shareText });
      } catch (error) {
        console.error("Error sharing via Web Share API:", error);
      }
    } else {
      alert(`Share this link: ${customShareUrl}`);
    }
  };

  const add_call_timeline = () => {
    const url = "api/timeline/add_call_timeline/";
    const payload = {
      contact_id: selectedPeople[0].contact_id,
      phone: selectedPeople[0].phone,
    };
    axios
      .post(url, payload, config)
      .then(() => handleTimelineRefresh())
      .catch((err) => console.log("add_call_timeline err", err));
  };

  const callStartTime = useRef(null);
  const handleCallClick = (person) => {
    callStartTime.current = Date.now();
    setCallInitiated(true);
    window.location.href = `tel:${person.phone}`;
  };

  const exitPeopleSpecialView = () => {
    setIsShowArchived(false);
    setIsShowPotential(false);
    setIsAbout(false);
    setSelectedPeople([]);
    setContactDetails([]);
    setContactCliked(false);
    setCheckAll(false);
    navigate("/people");
  };

  const openArchivedView = () => {
    setIsShowPotential(false);
    setIsShowArchived(true);
    clearSpecialViewSelection();
  };

  const openPotentialView = () => {
    setIsShowArchived(false);
    setIsShowPotential(true);
    clearSpecialViewSelection();
    setIsAbout(true);
  };

  // Use searchResults when in search mode, else use normal list
  const activeContact = isSearchMode
    ? searchResults
    : isShowPotential
      ? potentialContactList
      : isShowArchived
        ? archiveContactList
        : contactList;

  const activeContactMobile = isShowPotential
    ? potentialContactListMobile
    : isShowArchived
      ? archiveContactListMobile
      : MobileData;

  const handleClickImportBack = () => {
    setImportContacts(false);
    if (contactList.length > 0 && [contactList[0]]) {
      setSelectedPeople([contactList[0]]);
    } else {
      setSelectedPeople([]);
    }
    setCheckAll(false);
  };

  const handleFetchContact = () => {
    setContactList([]);
    setMobileData({});
    setOffset(0);
    setCurrentLimit(15);
    setHasMore(true);
    setTimeout(() => {
      get_contact_log();
      handleClickImportBack();
    }, 0);
  };

  const handleBusinessCardScanSuccess = (scannedData) => {
    setScannerInitialData(scannedData);
    setIsEditContact(false);
    setImportContacts(false);
    setShowBusinessCardScanner(false);
    setShowAddContact(true);
  };

  const handleCloseAddContact = () => {
    setShowAddContact(false);
    setScannerInitialData(null);
  };

  // Active filter chips (shown below search bar on mobile / below nav on desktop)
  const renderActiveFilterChips = () => {
    if (activeFilterCount === 0 && !searchQuery) return null;
    return (
      <div className="people_active_filter_chips">
        {searchQuery && (
          <span className="people_filter_chip">
            "{searchQuery}"
            <button onClick={() => setSearchQuery("")}>
              <CloseIcon style={{ fontSize: 11 }} />
            </button>
          </span>
        )}
        {Object.entries(searchFilters).map(([key, val]) =>
          val ? (
            <span key={key} className="people_filter_chip">
              {key}: {val}
              <button onClick={() => clearOneFilter(key)}>
                <CloseIcon style={{ fontSize: 11 }} />
              </button>
            </span>
          ) : null,
        )}
        {isSearchMode && (
          <span className="people_search_results_count">
            {isSearching
              ? "Searching..."
              : `${searchTotal} result${searchTotal !== 1 ? "s" : ""}`}
          </span>
        )}
      </div>
    );
  };

  // Inline search+filter JSX — NOT a sub-component so cursor never resets
  const renderSearchBar = () => (
    <div
      className="people_search_bar_wrapper"
      // style={{ padding: 0, width: "100%" }}
    >
      <div className="people_search_input_wrap">
        <span className="people_search_icon">
          {isSearching ? (
            <ThreeDots height="16" width="24" radius="4" color="#5B5574" />
          ) : (
            <SearchIcon style={{ fontSize: 18, color: "#aaa" }} />
          )}
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${contactList.length} ...`}
          className="people_search_input"
        />
        {(searchQuery || activeFilterCount > 0) && (
          <button className="people_search_clear_btn" onClick={clearSearch}>
            <CloseIcon style={{ fontSize: 16 }} />
          </button>
        )}
      </div>

      {/* Filter Button */}
      <div ref={filterPanelRef} style={{ position: "relative" }}>
        <button
          className={
            "people_filter_btn " +
            (filterPanelOpen || activeFilterCount > 0
              ? "people_filter_btn_active"
              : "")
          }
          onClick={() => setFilterPanelOpen((o) => !o)}
        >
          <FilterAltOutlinedIcon />
        </button>

        {filterPanelOpen && (
          <div className="people_filter_panel">
            <div className="people_filter_panel_header">
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <button
                  className="people_filter_clear_all"
                  onClick={() =>
                    setSearchFilters({ priority: "", company: "", tag: "" })
                  }
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="people_filter_section">
              <label className="people_filter_label">Priority</label>
              <div className="people_filter_pills">
                {["High", "Medium", "Low"].map((p) => (
                  <button
                    key={p}
                    onClick={() =>
                      setSearchFilters((f) => ({
                        ...f,
                        priority: f.priority === p ? "" : p,
                      }))
                    }
                    className={
                      "people_filter_pill " +
                      (searchFilters.priority === p
                        ? "people_filter_pill_active people_filter_pill_priority_" +
                          p.toLowerCase()
                        : "")
                    }
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="people_filter_section">
              <label className="people_filter_label">Tag</label>
              <div className="people_filter_pills">
                {[
                  "Client",
                  "Prospect",
                  "Partner",
                  "Manually Added",
                  "Lead",
                ].map((t) => (
                  <button
                    key={t}
                    onClick={() =>
                      setSearchFilters((f) => ({
                        ...f,
                        tag: f.tag === t ? "" : t,
                      }))
                    }
                    className={
                      "people_filter_pill " +
                      (searchFilters.tag === t
                        ? "people_filter_pill_active"
                        : "")
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderTagModal = () => (
    <BlurPopup
      onClose={() => setShowTagModal(false)}
      openState={showTagModal}
      ComponentClass={isMobile ? "tag_modal_bottom_sheet" : "tag_modal_center"}
    >
      <div className="tag_modal_wrapper  ">
        {/* Header */}
        <div className="tag_modal_header">
          <h5>Edit Tags</h5>
          <button
            className="tag_modal_close_btn"
            onClick={() => setShowTagModal(false)}
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>

        {/* Selected tags preview (max 3 shown as chips) */}
        {tagModalSelected.length > 0 && (
          <div className="tag_modal_selected_preview">
            {tagModalSelected.map((name) => {
              const tagObj = tagModalTagList.find((t) => t.name === name);
              return (
                <span
                  key={name}
                  className="tag_modal_chip"
                  style={{
                    backgroundColor: tagObj ? `${tagObj.color}1a` : "#f2f2f7",
                    color: tagObj?.color || "#555",
                  }}
                >
                  {name}
                  <button
                    onClick={() =>
                      setTagModalSelected((prev) =>
                        prev.filter((t) => t !== name),
                      )
                    }
                  >
                    <CloseIcon style={{ fontSize: 10 }} />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {/* Tag list */}
        {tagModalLoading ? (
          <div className="tag_modal_loading">
            <ThreeDots height="30" width="40" radius="6" color="#5B5574" />
          </div>
        ) : (
          <div className="tag_modal_list">
            {tagModalTagList.map((tag) => {
              const isSelected = tagModalSelected.includes(tag.name);
              const atMax = tagModalSelected.length >= 3 && !isSelected;
              return (
                <div
                  key={tag.name}
                  className={
                    "tag_modal_item " +
                    (isSelected ? "tag_modal_item_active" : "") +
                    (atMax ? " tag_modal_item_disabled" : "")
                  }
                  onClick={() => {
                    if (atMax) return;
                    setTagModalSelected((prev) =>
                      isSelected
                        ? prev.filter((t) => t !== tag.name)
                        : [...prev, tag.name],
                    );
                  }}
                >
                  <span
                    className="tag_modal_dot"
                    // style={{ backgroundColor: tag.color }}
                  />
                  <span
                    className="tag_modal_name"
                    style={{
                      // backgroundColor: `${tag.color}1a`,
                      color: tag.color,
                    }}
                  >
                    {tag.name}
                  </span>
                  {isSelected && (
                    <CheckIcon
                      style={{
                        fontSize: 16,
                        color: tag.color,
                        marginLeft: "auto",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Max 3 warning */}
        {tagModalSelected.length >= 3 && (
          <p className="tag_modal_max_hint">Maximum 3 tags allowed</p>
        )}

        {/* Create new tag */}
        {!showCreateTagInModal ? (
          <button
            className="tag_modal_create_btn"
            onClick={() => setShowCreateTagInModal(true)}
          >
            <AddCircleOutlineIcon fontSize="small" /> Create a tag
          </button>
        ) : (
          <div className="tag_modal_create_form">
            <input
              type="text"
              placeholder="Tag name"
              value={newTagData.tag}
              onChange={(e) =>
                setNewTagData({ ...newTagData, tag: e.target.value })
              }
              className="tag_modal_create_input"
            />
            {/* {newTagData.tag && (
              <div className="tag_modal_color_row">
                <span>Pick a colour</span>
                <div className="tag_modal_colors">

                  {TAG_COLORS.map((c) => (
                    <button
                      key={c}
                      style={{ backgroundColor: c }}
                      className={
                        "tag_modal_color_btn " +
                        (newTagData.color === c ? "tag_modal_color_active" : "")
                      }
                      onClick={() => setNewTagData({ ...newTagData, color: c })}
                    />
                  ))}
                </div>
              </div>
            )} */}
            <div className="tag_modal_create_actions">
              <button
                className="btn-outline"
                onClick={() => {
                  setShowCreateTagInModal(false);
                  setNewTagData({ tag: "" });
                }}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                disabled={!newTagData.tag}
                onClick={addTagInModal}
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Save button */}
        {!showCreateTagInModal && (
          <div className="tag_modal_footer">
            <button
              className="btn-primary tag_modal_save_btn"
              onClick={saveTagModal}
            >
              {tagModalSaving ? (
                <ThreeDots height="22" width="50" radius="8" color="#fff" />
              ) : (
                "Save"
              )}
            </button>
          </div>
        )}
      </div>
    </BlurPopup>
  );

  const renderPotentialTagModal = () => (
    <BlurPopup
      onClose={() => setShowPotentialTagModal(false)}
      openState={showPotentialTagModal}
      ComponentClass={isMobile ? "tag_modal_bottom_sheet" : "tag_modal_center"}
    >
      <div className="tag_modal_wrapper">
        <div className="tag_modal_header">
          <h5>Add Tags</h5>
          <button
            className="tag_modal_close_btn"
            onClick={() => setShowPotentialTagModal(false)}
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>

        {potentialTagModalSelected.length > 0 && (
          <div className="tag_modal_selected_preview">
            {potentialTagModalSelected.map((name) => {
              const tagObj = potentialTagModalTagList.find(
                (t) => t.name === name,
              );
              return (
                <span
                  key={name}
                  className="tag_modal_chip"
                  style={{
                    backgroundColor: tagObj ? `${tagObj.color}1a` : "#f2f2f7",
                    color: tagObj?.color || "#555",
                  }}
                >
                  {name}
                  <button
                    onClick={() =>
                      setPotentialTagModalSelected((prev) =>
                        prev.filter((t) => t !== name),
                      )
                    }
                  >
                    <CloseIcon style={{ fontSize: 10 }} />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {potentialTagModalLoading ? (
          <div className="tag_modal_loading">
            <ThreeDots height="30" width="40" radius="6" color="#5B5574" />
          </div>
        ) : (
          <div className="tag_modal_list">
            {potentialTagModalTagList.map((tag) => {
              const isSelected = potentialTagModalSelected.includes(tag.name);
              const atMax =
                potentialTagModalSelected.length >= 3 && !isSelected;
              return (
                <div
                  key={tag.name}
                  className={
                    "tag_modal_item " +
                    (isSelected ? "tag_modal_item_active" : "") +
                    (atMax ? " tag_modal_item_disabled" : "")
                  }
                  onClick={() => {
                    if (atMax) return;
                    setPotentialTagModalSelected((prev) =>
                      isSelected
                        ? prev.filter((t) => t !== tag.name)
                        : [...prev, tag.name],
                    );
                  }}
                >
                  <span className="tag_modal_dot" />
                  <span className="tag_modal_name" style={{ color: tag.color }}>
                    {tag.name}
                  </span>
                  {isSelected && (
                    <CheckIcon
                      style={{
                        fontSize: 16,
                        color: tag.color,
                        marginLeft: "auto",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {potentialTagModalSelected.length >= 3 && (
          <p className="tag_modal_max_hint">Maximum 3 tags allowed</p>
        )}

        <div className="tag_modal_footer">
          <button
            className="btn-primary tag_modal_save_btn"
            onClick={savePotentialContactToPeople}
            disabled={potentialTagModalSelected.length === 0}
          >
            {potentialTagModalSaving ? (
              <ThreeDots height="22" width="50" radius="8" color="#fff" />
            ) : (
              "Move to contact"
            )}
          </button>
        </div>
      </div>
    </BlurPopup>
  );

  // renderPeopleNav is a render function (NOT a React component) — this is critical
  // so React never unmounts/remounts the search input on re-renders
  const renderPeopleNav = () => {
    if (isShowPotential) {
      return (
        <nav className="people_nav people_nav_special">
          <div className="people_nav_left">
            <div className="people_btn_top">
              <button onClick={exitPeopleSpecialView}>
                <ArrowBackOutlinedIcon /> Potential (
                {potentialContactList.length})
              </button>
            </div>
          </div>
          {!isMobile && selectedPeople.length > 0 && (
            <div className="people_nav_right">
              <button onClick={handleDeletePotential}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6C4.71667 6 4.47917 5.90417 4.2875 5.7125C4.09583 5.52083 4 5.28333 4 5C4 4.71667 4.09583 4.47917 4.2875 4.2875C4.47917 4.09583 4.71667 4 5 4H9C9 3.71667 9.09583 3.47917 9.2875 3.2875C9.47917 3.09583 9.71667 3 10 3H14C14.2833 3 14.5208 3.09583 14.7125 3.2875C14.9042 3.47917 15 3.71667 15 4H19C19.2833 4 19.5208 4.09583 19.7125 4.2875C19.9042 4.47917 20 4.71667 20 5C20 5.28333 19.9042 5.52083 19.7125 5.7125C19.5208 5.90417 19.2833 6 19 6V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM17 6H7V19H17V6ZM10 17C10.2833 17 10.5208 16.9042 10.7125 16.7125C10.9042 16.5208 11 16.2833 11 16V9C11 8.71667 10.9042 8.47917 10.7125 8.2875C10.5208 8.09583 10.2833 8 10 8C9.71667 8 9.47917 8.09583 9.2875 8.2875C9.09583 8.47917 9 8.71667 9 9V16C9 16.2833 9.09583 16.5208 9.2875 16.7125C9.47917 16.9042 9.71667 17 10 17ZM14 17C14.2833 17 14.5208 16.9042 14.7125 16.7125C14.9042 16.5208 15 16.2833 15 16V9C15 8.71667 14.9042 8.47917 14.7125 8.2875C14.5208 8.09583 14.2833 8 14 8C13.7167 8 13.4792 8.09583 13.2875 8.2875C13.0958 8.47917 13 8.71667 13 9V16C13 16.2833 13.0958 16.5208 13.2875 16.7125C13.4792 16.9042 13.7167 17 14 17Z"
                    fill="black"
                  />
                </svg>
              </button>
              <button className="restore_btn" onClick={openPotentialTagModal}>
                <RefreshOutlinedIcon fontSize="small" />
                Move to contact
              </button>
            </div>
          )}
        </nav>
      );
    }

    if (isShowArchived) {
      return (
        <nav className="people_nav people_nav_special">
          <div className="people_nav_left">
            <div className="people_btn_top">
              <button onClick={exitPeopleSpecialView}>
                <ArrowBackOutlinedIcon /> Archived ({archiveContactList.length})
              </button>
            </div>
          </div>
          {!isMobile && selectedPeople.length > 0 && (
            <div className="people_nav_right">
              <button onClick={delete_contact}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6C4.71667 6 4.47917 5.90417 4.2875 5.7125C4.09583 5.52083 4 5.28333 4 5C4 4.71667 4.09583 4.47917 4.2875 4.2875C4.47917 4.09583 4.71667 4 5 4H9C9 3.71667 9.09583 3.47917 9.2875 3.2875C9.47917 3.09583 9.71667 3 10 3H14C14.2833 3 14.5208 3.09583 14.7125 3.2875C14.9042 3.47917 15 3.71667 15 4H19C19.2833 4 19.5208 4.09583 19.7125 4.2875C19.9042 4.47917 20 4.71667 20 5C20 5.28333 19.9042 5.52083 19.7125 5.7125C19.5208 5.90417 19.2833 6 19 6V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM17 6H7V19H17V6ZM10 17C10.2833 17 10.5208 16.9042 10.7125 16.7125C10.9042 16.5208 11 16.2833 11 16V9C11 8.71667 10.9042 8.47917 10.7125 8.2875C10.5208 8.09583 10.2833 8 10 8C9.71667 8 9.47917 8.09583 9.2875 8.2875C9.09583 8.47917 9 8.71667 9 9V16C9 16.2833 9.09583 16.5208 9.2875 16.7125C9.47917 16.9042 9.71667 17 10 17ZM14 17C14.2833 17 14.5208 16.9042 14.7125 16.7125C14.9042 16.5208 15 16.2833 15 16V9C15 8.71667 14.9042 8.47917 14.7125 8.2875C14.5208 8.09583 14.2833 8 14 8C13.7167 8 13.4792 8.09583 13.2875 8.2875C13.0958 8.47917 13 8.71667 13 9V16C13 16.2833 13.0958 16.5208 13.2875 16.7125C13.4792 16.9042 13.7167 17 14 17Z"
                    fill="black"
                  />
                </svg>
              </button>
              <button className="restore_btn" onClick={restore_contact}>
                <RefreshOutlinedIcon fontSize="small" />
                Restore
              </button>
            </div>
          )}
        </nav>
      );
    }

    return (
      <nav className="people_nav">
        <div
          className="people_nav_left"
          style={
            !isMobile
              ? {
                  display: "flex",
                  alignItems: "center",
                  flex: 1,
                  gap: 12,
                  minWidth: 0,
                }
              : {}
          }
        >
          {!isMobile && (
            <div style={{ width: "420px", flexShrink: 0 }}>
              {renderSearchBar()}
            </div>
          )}

          <div
            className="people_btn_top"
            style={
              !isMobile
                ? { flexShrink: 0, order: 1 }
                : { order: 1 }
            }
          >
            {/* Archived button — desktop always visible, mobile only when no selection */}
            <CustomTooltip
              arrow
              title={
                <>
                  You can view the <br /> archived contacts here
                </>
              }
            >
              {isMobile ? (
                selectedPeople.length === 0 && (
                  <button onClick={openArchivedView}>
                    <ArchiveIcon fontSize="small" />
                    <span className="people_nav_label">
                      {isCompactMobile ? "" : "Archived"}
                    </span>
                  </button>
                )
              ) : (
                <button onClick={openArchivedView}>
                  <ArchiveIcon fontSize="small" />
                  <span className="people_nav_label">Archived</span>
                </button>
              )}
            </CustomTooltip>
          </div>

          <div
            className="people_btn_top"
            style={
              !isMobile
                ? { flexShrink: 0, order: 3 }
                : { order: isCompactMobile ? 2 : 3 }
            }
          >
            <CustomTooltip
              arrow
              title={
                <>
                  You can view the <br /> potential contacts here
                </>
              }
            >
              {isMobile ? (
                selectedPeople.length === 0 && (
                  <button onClick={openPotentialView}>
                    <PersonAddAltOutlinedIcon fontSize="small" />
                    <span className="people_nav_label">
                      {isCompactMobile ? "" : "Potential"}
                    </span>
                  </button>
                )
              ) : (
                <button onClick={openPotentialView}>
                  <PersonAddAltOutlinedIcon fontSize="small" />
                  <span className="people_nav_label">Potential</span>
                </button>
              )}
            </CustomTooltip>
          </div>

          <div
            className="people_btn_top_right"
            style={
              !isMobile
                ? { flexShrink: 0, order: 2 }
                : { order: isCompactMobile ? 3 : 2 }
            }
          >
            {(isMobile && selectedPeople.length === 0) || !isMobile ? (
              <div
                ref={dropdownRef}
                style={{ position: "relative", display: "inline-block" }}
              >
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="add_btn"
                >
                  <AddCircleOutlineIcon fontSize="small" />
                  <span className="people_nav_label">
                    Add new
                  </span>
                </button>
                {dropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: 0,
                      background: "white",
                      border: "1px solid #ccc",
                      borderRadius: "16px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                      zIndex: 999,
                      padding: "16px",
                      minWidth: "190px",
                    }}
                  >
                    <div
                      onClick={() => {
                        setScannerInitialData(null);
                        setIsEditContact(false);
                        setShowAddContact(true);
                        setDropdownOpen(false);
                        setImportContacts(false);
                      }}
                      style={{
                        paddingBottom: "10px",
                        cursor: "pointer",
                        fontSize: "14px",
                        borderBottom: "1px solid #ccc",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f6f6f6")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "white")
                      }
                    >
                      Add a single contact
                    </div>
                    <div
                      onClick={() => {
                        setImportContacts(true);
                        setDropdownOpen(false);
                      }}
                      style={{
                        paddingTop: "10px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f6f6f6")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "white")
                      }
                    >
                      Import Contacts
                    </div>
                    <div
                      onClick={() => {
                        setShowBusinessCardScanner(true);
                        setDropdownOpen(false);
                      }}
                      style={{
                        paddingTop: "10px",
                        cursor: "pointer",
                        fontSize: "14px",
                        borderTop: "1px solid #ccc",
                        marginTop: "10px",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f6f6f6")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "white")
                      }
                    >
                      Scan Business Card
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
        {isMobile && selectedPeople.length > 0 ? (
          <div className="people_nav_right">
            {isShowPotential ? (
              <>
                <button onClick={handleDeletePotential}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6C4.71667 6 4.47917 5.90417 4.2875 5.7125C4.09583 5.52083 4 5.28333 4 5C4 4.71667 4.09583 4.47917 4.2875 4.2875C4.47917 4.09583 4.71667 4 5 4H9C9 3.71667 9.09583 3.47917 9.2875 3.2875C9.47917 3.09583 9.71667 3 10 3H14C14.2833 3 14.5208 3.09583 14.7125 3.2875C14.9042 3.47917 15 3.71667 15 4H19C19.2833 4 19.5208 4.09583 19.7125 4.2875C19.9042 4.47917 20 4.71667 20 5C20 5.28333 19.9042 5.52083 19.7125 5.7125C19.5208 5.90417 19.2833 6 19 6V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM17 6H7V19H17V6ZM10 17C10.2833 17 10.5208 16.9042 10.7125 16.7125C10.9042 16.5208 11 16.2833 11 16V9C11 8.71667 10.9042 8.47917 10.7125 8.2875C10.5208 8.09583 10.2833 8 10 8C9.71667 8 9.47917 8.09583 9.2875 8.2875C9.09583 8.47917 9 8.71667 9 9V16C9 16.2833 9.09583 16.5208 9.2875 16.7125C9.47917 16.9042 9.71667 17 10 17ZM14 17C14.2833 17 14.5208 16.9042 14.7125 16.7125C14.9042 16.5208 15 16.2833 15 16V9C15 8.71667 14.9042 8.47917 14.7125 8.2875C14.5208 8.09583 14.2833 8 14 8C13.7167 8 13.4792 8.09583 13.2875 8.2875C13.0958 8.47917 13 8.71667 13 9V16C13 16.2833 13.0958 16.5208 13.2875 16.7125C13.4792 16.9042 13.7167 17 14 17Z"
                      fill="black"
                    />
                  </svg>
                </button>
                <button onClick={openPotentialTagModal}>
                  <AddCircleOutlineIcon className="icon" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setShowNoteReminder(true);
                    setShowMenuPopup(false);
                  }}
                >
                  <EditNoteIcon className="icon" />
                </button>
                <button
                  disabled={selectedPeople.length > 1 || !selectedPeople[0]?.phone}
                  onClick={() => handleCallClick(selectedPeople[0])}
                >
                  <CallIcon />
                </button>
                <CustomTooltip
                  arrow
                  title={
                    selectedPeople.length > 50 ? (
                      <>
                        You can only send emails to
                        <br /> up to 50 recipients at a time
                      </>
                    ) : (
                      ""
                    )
                  }
                >
                  <button
                    disabled={selectedPeople.length > 50}
                    onClick={() => {
                      setShowSendEmail(true);
                      setShowMenuPopup(false);
                    }}
                  >
                    <MailOutlineIcon className="icon" />
                  </button>
                </CustomTooltip>
                {selectedPeople.length < 2 && (
                  <button onClick={() => setShowBooking(true)}>
                    <EventIcon />
                  </button>
                )}
                <button onClick={() => setShowMenuPopup(true)}>
                  <MoreVertIcon className="icon" />
                </button>
              </>
            )}
            {showMenuPopup && !isUserDetailsMenu && (
              <BlurPopup
                onClose={() => {
                  setShowMenuPopup(false);
                  setIsUserDetailsMenu(false);
                }}
                openState={showMenuPopup}
                ComponentClass={
                  "people_nav_popup " +
                  (isUserDetailsMenu ? "people_nav_popup_details" : "")
                }
              >
                <div className="blurpopup_con_wrapper">
                  {selectedPeople.length < 2 && (
                    <button
                      onClick={() => {
                        setShowBooking(true);
                        setShowMenuPopup(false);
                      }}
                    >
                      <EventIcon /> Book meeting
                    </button>
                  )}
                  <CustomTooltip
                    arrow
                    title={
                      selectedPeople.length > 50 ? (
                        <>
                          You can only send emails to
                          <br /> up to 50 recipients at a time
                        </>
                      ) : (
                        ""
                      )
                    }
                  >
                    <button
                      disabled={selectedPeople.length > 50}
                      onClick={() => {
                        setShowSendEmail(true);
                        setShowMenuPopup(false);
                      }}
                    >
                      <MailOutlineIcon />
                      {selectedPeople.length > 1 ? "Group " : ""}Email
                    </button>
                  </CustomTooltip>
                  <button
                    disabled={
                      selectedPeople.length > 1 || !selectedPeople[0]?.phone
                    }
                    onClick={() => handleCallClick(selectedPeople[0])}
                  >
                    <CallIcon />
                    Call
                  </button>
                  <button
                    onClick={() => {
                      setShowNoteReminder(true);
                      setShowMenuPopup(false);
                    }}
                  >
                    <EditNoteIcon />
                    Note & reminder
                  </button>
                  {selectedPeople.length < 2 && (
                    <>
                      <button onClick={handleShareClick}>
                        <ShareIcon />
                        Share
                      </button>
                      <button
                        onClick={() => {
                          setShowMenuPopup(false);
                          setShowSaveToPhone(true);
                        }}
                      >
                        <SaveIcon />
                        Save to phone
                      </button>
                      <button
                        onClick={() => {
                          setShowAddContact(true);
                          setShowMenuPopup(false);
                          setIsEditContact(true);
                        }}
                      >
                        <EditIcon />
                        Edit contact
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setShowConfirmArchived(true);
                      setShowMenuPopup(false);
                    }}
                  >
                    <ArchiveIcon />
                    Archive
                  </button>
                </div>
              </BlurPopup>
            )}
          </div>
        ) : (
          ""
        )}
      </nav>
    );
  };

  const renderMobileSpecialHeaderActions = () => {
    if (!isMobile || selectedPeople.length === 0) return null;

    if (isShowPotential) {
      return (
        <div className="people_nav_right header_icons people_nav_right_plain">
          <button onClick={handleDeletePotential}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6C4.71667 6 4.47917 5.90417 4.2875 5.7125C4.09583 5.52083 4 5.28333 4 5C4 4.71667 4.09583 4.47917 4.2875 4.2875C4.47917 4.09583 4.71667 4 5 4H9C9 3.71667 9.09583 3.47917 9.2875 3.2875C9.47917 3.09583 9.71667 3 10 3H14C14.2833 3 14.5208 3.09583 14.7125 3.2875C14.9042 3.47917 15 3.71667 15 4H19C19.2833 4 19.5208 4.09583 19.7125 4.2875C19.9042 4.47917 20 4.71667 20 5C20 5.28333 19.9042 5.52083 19.7125 5.7125C19.5208 5.90417 19.2833 6 19 6V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM17 6H7V19H17V6ZM10 17C10.2833 17 10.5208 16.9042 10.7125 16.7125C10.9042 16.5208 11 16.2833 11 16V9C11 8.71667 10.9042 8.47917 10.7125 8.2875C10.5208 8.09583 10.2833 8 10 8C9.71667 8 9.47917 8.09583 9.2875 8.2875C9.09583 8.47917 9 8.71667 9 9V16C9 16.2833 9.09583 16.5208 9.2875 16.7125C9.47917 16.9042 9.71667 17 10 17ZM14 17C14.2833 17 14.5208 16.9042 14.7125 16.7125C14.9042 16.5208 15 16.2833 15 16V9C15 8.71667 14.9042 8.47917 14.7125 8.2875C14.5208 8.09583 14.2833 8 14 8C13.7167 8 13.4792 8.09583 13.2875 8.2875C13.0958 8.47917 13 8.71667 13 9V16C13 16.2833 13.0958 16.5208 13.2875 16.7125C13.4792 16.9042 13.7167 17 14 17Z"
                fill="black"
              />
            </svg>
            Discard
          </button>
          <button className="restore_btn" onClick={openPotentialTagModal}>
            <RefreshOutlinedIcon fontSize="small" />
            Move to contact
          </button>
        </div>
      );
    }

    if (isShowArchived) {
      return (
        <div className="people_nav_right header_icons people_nav_right_plain">
          <button onClick={delete_contact}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6C4.71667 6 4.47917 5.90417 4.2875 5.7125C4.09583 5.52083 4 5.28333 4 5C4 4.71667 4.09583 4.47917 4.2875 4.2875C4.47917 4.09583 4.71667 4 5 4H9C9 3.71667 9.09583 3.47917 9.2875 3.2875C9.47917 3.09583 9.71667 3 10 3H14C14.2833 3 14.5208 3.09583 14.7125 3.2875C14.9042 3.47917 15 3.71667 15 4H19C19.2833 4 19.5208 4.09583 19.7125 4.2875C19.9042 4.47917 20 4.71667 20 5C20 5.28333 19.9042 5.52083 19.7125 5.7125C19.5208 5.90417 19.2833 6 19 6V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM17 6H7V19H17V6ZM10 17C10.2833 17 10.5208 16.9042 10.7125 16.7125C10.9042 16.5208 11 16.2833 11 16V9C11 8.71667 10.9042 8.47917 10.7125 8.2875C10.5208 8.09583 10.2833 8 10 8C9.71667 8 9.47917 8.09583 9.2875 8.2875C9.09583 8.47917 9 8.71667 9 9V16C9 16.2833 9.09583 16.5208 9.2875 16.7125C9.47917 16.9042 9.71667 17 10 17ZM14 17C14.2833 17 14.5208 16.9042 14.7125 16.7125C14.9042 16.5208 15 16.2833 15 16V9C15 8.71667 14.9042 8.47917 14.7125 8.2875C14.5208 8.09583 14.2833 8 14 8C13.7167 8 13.4792 8.09583 13.2875 8.2875C13.0958 8.47917 13 8.71667 13 9V16C13 16.2833 13.0958 16.5208 13.2875 16.7125C13.4792 16.9042 13.7167 17 14 17Z"
                fill="black"
              />
            </svg>
            Delete
          </button>
          <button className="restore_btn" onClick={restore_contact}>
            <RefreshOutlinedIcon fontSize="small" />
            Restore
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="people_con">
      {ToastText.show && <Toast text={ToastText.text} />}
      {!importContacts ? (
        <div
          className="people_left"
          style={
            selectedPeople.length > 0 ? { width: "70%" } : { width: "100%" }
          }
        >
          {isMobile && (
            <>
              <div className="people_header">
                <h1>People</h1>
                {isShowArchived || isShowPotential
                  ? renderMobileSpecialHeaderActions()
                  : renderPeopleNav()}
              </div>
              {(isShowArchived || isShowPotential) && renderPeopleNav()}
            </>
          )}
          {/* Remove ye line */}
          {/* {renderPeopleNav()} */}

          {/* Desktop only */}
          {!isMobile && (
            <>
              {/* <div className="people_header">
      <h1>People</h1>
    </div> */}
              {renderPeopleNav()}
            </>
          )}
          {!isShowArchived && !isShowPotential && isMobile && (
            <>
              <div className="people_mobile_search_row">
                {renderSearchBar()}
              </div>

              {renderActiveFilterChips()}
            </>
          )}
          {/* Desktop: filter chips below nav (search is already inline in nav) */}
          {!isShowArchived && !isShowPotential && !isMobile && (
            <>{renderActiveFilterChips()}</>
          )}

          {activeContact.length > 0 || isShowArchived || isShowPotential ? (
            !isMobile ? (
              <div className="people_list_pc">
                <div className="person_card_header">
                  <input
                    className="list_checkbox"
                    type="checkbox"
                    checked={checkAll}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCheckAll(true);
                        if (isShowArchived)
                          setSelectedPeople(archiveContactList);
                        else if (isShowPotential)
                          setSelectedPeople(potentialContactList);
                        else setSelectedPeople(contactList);
                      } else {
                        setSelectedPeople([]);
                        setCheckAll(false);
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      setSortByName(!sortByName);
                      const sortedContacts = [...contactList].sort((a, b) =>
                        sortByName
                          ? b.name.localeCompare(a.name)
                          : a.name.localeCompare(b.name),
                      );
                      setContactList(sortedContacts);
                    }}
                    className="person_header_people"
                  >
                    <SortByAlphaIcon className="me-2" />
                    People
                  </button>
                  <button className="person_header_btn">
                    <TodayIcon /> Upcoming
                  </button>
                  <button className="person_header_btn">Priority</button>
                  <button
                    onClick={() => {
                      setSortByDate(!sortByDate);
                      const sortedContacts = [...contactList].sort((a, b) =>
                        sortByDate
                          ? new Date(b.date_added).getTime() -
                            new Date(a.date_added).getTime()
                          : new Date(a.date_added).getTime() -
                            new Date(b.date_added).getTime(),
                      );
                      setContactList(sortedContacts);
                    }}
                    className="person_header_btn"
                  >
                    <SwapVertIcon /> Time
                  </button>
                </div>
                <div className="people_list_wrapper">
                  <div className="people_list_item">
                    {activeContact.map((person) => {
                      return (
                        <div
                          className={
                            "person_card " +
                            (isPersonSelected(person)
                              ? "active_person_card"
                              : "")
                          }
                          key={person.contact_id}
                        >
                          <input
                            className="list_checkbox"
                            type="checkbox"
                            checked={selectedPeople.some(
                              (contact) =>
                                contact?.contact_id === person?.contact_id,
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPeople((prevChecked) =>
                                  isPersonSelected(person, prevChecked)
                                    ? prevChecked
                                    : [...prevChecked, person],
                                );
                              } else {
                                setSelectedPeople((prevChecked) =>
                                  prevChecked.filter(
                                    (item) => !isSamePerson(item, person),
                                  ),
                                );
                                navigate("/people");
                              }
                            }}
                          />
                          <div
                            onClick={() => handlePersonSelect(person)}
                            className="person_card_left"
                          >
                            {person.is_profile_pic && person.image ? (
                              <img
                                className="person_image_main"
                                src={person.image}
                                alt="person_image"
                                loading="lazy"
                              />
                            ) : (
                              <div
                                className="person_image"
                                style={{
                                  backgroundColor: `${person.image_color}33`,
                                }}
                              >
                                <span style={{ color: person.image_color }}>
                                  {person.name.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div className="person_details">
                              <h4>{person.name}</h4>
                              <div className="tags">
                                {person.tags.map((tag, i) => (
                                  <span
                                    className="tag"
                                    style={{
                                      backgroundColor: tag && `${tag.color}1a`,
                                      color: tag && `${tag.color}`,
                                    }}
                                    key={i}
                                  >
                                    {tag && tag.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handlePersonSelect(person)}
                            className="person_card_btn"
                          >
                            {person.upcoming === "Reminder" ? (
                              <>
                                <EditNoteIcon /> Reminder
                              </>
                            ) : person.upcoming === "Meeting" ? (
                              <>
                                <EventIcon /> Meeting
                              </>
                            ) : (
                              person.upcoming
                            )}
                          </button>
                          <div className="person_card_select">
                            <select
                              onChange={(e) => {
                                if (!isShowArchived)
                                  update_priority(person, e.target.value);
                              }}
                              value={person.priority}
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                            </select>
                          </div>
                          <button className="person_card_btn">
                            {moment(person.date_added).calendar()}
                          </button>
                        </div>
                      );
                    })}
                    {(isShowArchived || isShowPotential) &&
                      activeContact.length === 0 && (
                        <p className="no_archived_contacts">
                          {isShowPotential
                            ? "You have no potential contacts"
                            : "You have no archived contacts"}
                        </p>
                      )}
                    {/* No search results state */}
                    {isSearchMode &&
                      activeContact.length === 0 &&
                      !isSearching && (
                        <div className="people_no_search_results">
                          <span style={{ fontSize: 32 }}>🔍</span>
                          <p>No contacts found</p>
                          <button onClick={clearSearch}>Clear search</button>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ) : (
              /* ── MOBILE LIST ── */
              <div className="people_list">
                {isSearchMode
                  ? // Mobile search results (flat list, no date grouping)
                    searchResults.map((person) => (
                      <div
                        className={
                          "person_card " +
                          (isPersonSelected(person) ? "active_person_card" : "")
                        }
                        key={person.contact_id + "search"}
                      >
                        <div
                          className="person_image"
                          style={{ backgroundColor: `${person.image_color}33` }}
                          onClick={() => handlePersonSelect(person)}
                        >
                          {isPersonSelected(person) ? (
                            <CheckIcon style={{ color: person.image_color }} />
                          ) : person.image ? (
                            <img
                              className="person_image"
                              src={person.image}
                              alt="person_image"
                              loading="lazy"
                            />
                          ) : (
                            <span style={{ color: person.image_color }}>
                              {person.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div
                          onClick={(e) => {
                            if (!isLongPress.current) {
                              if (selectedPeople.length === 0) {
                                handleClick(person);
                                setContactCliked(true);
                              } else handlePersonSelect(person);
                            } else e.preventDefault();
                          }}
                          onMouseDown={() => handleMouseDown(person)}
                          onMouseUp={handleMouseUp}
                          onMouseLeave={handleLongPressEnd}
                          onTouchStart={(e) => {
                            e.preventDefault();
                            handleLongPressStart(person);
                          }}
                          onTouchEnd={(e) => {
                            handleLongPressEnd();
                            if (isLongPress.current) e.preventDefault();
                          }}
                          onContextMenu={(e) => e.preventDefault()}
                          className="person_details"
                        >
                          <h4>{person.name}</h4>
                          <div className="tags">
                            {person.tags.map((tag, i) => (
                              <span
                                className="tag"
                                style={{
                                  backgroundColor: tag && `${tag.color}1a`,
                                }}
                                key={i}
                              >
                                {tag && tag.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  : Object.entries(activeContactMobile).map(
                      ([date, contactEntries]) => (
                        <div key={date + "people"}>
                          <h3>{moment(date).format("ll")}</h3>
                          {contactEntries.map((person) => (
                            <div
                              className={
                                "person_card " +
                                (isPersonSelected(person)
                                  ? "active_person_card"
                                  : "")
                              }
                              key={person.contact_id + "person"}
                            >
                              <div
                                className="person_image"
                                style={{
                                  backgroundColor: `${person.image_color}33`,
                                }}
                                onClick={() => handlePersonSelect(person)}
                              >
                                {isPersonSelected(person) ? (
                                  <CheckIcon
                                    style={{ color: person.image_color }}
                                  />
                                ) : person.image ? (
                                  <img
                                    className="person_image"
                                    src={person.image}
                                    alt="person_image"
                                    loading="lazy"
                                  />
                                ) : (
                                  <span style={{ color: person.image_color }}>
                                    {person.name.charAt(0)}
                                  </span>
                                )}
                              </div>
                              <div
                                onClick={(e) => {
                                  if (!isLongPress.current) {
                                    if (selectedPeople.length === 0) {
                                      handleClick(person);
                                      setContactCliked(true);
                                    } else handlePersonSelect(person);
                                  } else e.preventDefault();
                                }}
                                onMouseDown={() => handleMouseDown(person)}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleLongPressEnd}
                                onTouchStart={(e) => {
                                  e.preventDefault();
                                  handleLongPressStart(person);
                                }}
                                onTouchEnd={(e) => {
                                  handleLongPressEnd();
                                  if (isLongPress.current) e.preventDefault();
                                }}
                                onContextMenu={(e) => e.preventDefault()}
                                className="person_details"
                              >
                                <h4>{person.name}</h4>
                                <div className="tags">
                                  {person.tags.map((tag, i) => (
                                    <span
                                      className="tag"
                                      style={{
                                        backgroundColor:
                                          tag && `${tag.color}1a`,
                                      }}
                                      key={i}
                                    >
                                      {tag && tag.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ),
                    )}
                {isSearchMode && searchResults.length === 0 && !isSearching && (
                  <div className="people_no_search_results">
                    <span style={{ fontSize: 32 }}>🔍</span>
                    <p>No contacts found</p>
                    <button onClick={clearSearch}>Clear search</button>
                  </div>
                )}
                {(isShowArchived || isShowPotential) &&
                  activeContact.length === 0 && (
                    <p className="no_archived_contacts">
                      {isShowPotential
                        ? "You have no potential contacts"
                        : "You have no archived contacts"}
                    </p>
                  )}
              </div>
            )
          ) : (
            ""
          )}

          {activeContact.length === 0 &&
            !hasMore &&
            !importContacts &&
            !isShowPotential &&
            !isShowArchived &&
            !isSearchMode && (
              <div className="no_people">
                <div className="no_people_top">
                  <h5 className="no_people_text">
                    All contacts will be
                    <br />
                    displayed here
                  </h5>
                  <LazyLoadImage
                    effect="blur"
                    wrapperClassName="people_img"
                    src={no_people_img}
                    alt="No People"
                  />
                  <h5 className="no_people_text2">
                    All contacts will be displayed here
                  </h5>
                  <div
                    onClick={() => setShowAddContact(true)}
                    className="people_add"
                  >
                    <button>
                      <AddIcon />
                    </button>
                    <p>Add your first contact</p>
                  </div>
                </div>
                <div className="no_people_bottom">
                  <p>
                    You may use any of the following ways to collect contacts
                  </p>
                  <div className="no_people_bottom_btns">
                    {no_data_guide.map((item, index) => (
                      <button key={index + "guide"}>
                        <LazyLoadImage
                          effect="blur"
                          wrapperClassName="guide_img"
                          src={item.img}
                          alt={item.title}
                        />
                        <span>{item.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
        </div>
      ) : (
        <UserUploadPage
          handleClickImportBack={handleClickImportBack}
          handleFetchContact={handleFetchContact}
        />
      )}

      {showMobilePeopleDetails &&
        selectedPeople.length > 0 &&
        !importContacts && (
          <div className="people_details">
            {selectedPeople.length === 1 ? (
              <div className="people_details_wrapper">
                <div className="people_details_top_wrapper">
                  <button
                    onClick={() => {
                      setContactCliked(false);
                      setSelectedPeople([]);
                      navigate("/people");
                    }}
                    className="back_btn"
                  >
                    <ArrowBackIcon fontSize="small" /> Back
                  </button>
                  <div className="people_details_top">
                    <div className="people_details_top_left">
                      {selectedPeople[0]?.image ? (
                        <img
                          className="people_avatar"
                          src={selectedPeople[0]?.image}
                          alt="person_image"
                          loading="lazy"
                        />
                      ) : (
                        <button
                          style={{
                            backgroundColor: `${selectedPeople[0]?.image_color}33`,
                            color: selectedPeople[0]?.image_color,
                          }}
                          className="people_avatar"
                        >
                          {selectedPeople[0]?.name.charAt(0)}
                        </button>
                      )}
                      <div className="people_details_text">
                        <h2>{selectedPeople[0]?.name}</h2>
                        <p>
                          {ContactDetails.designation &&
                            ContactDetails.designation}
                          {ContactDetails.company &&
                            "/" + ContactDetails.company}
                        </p>

                        <div className="peolple_cat_con">
                          {/* Row 1: first tag + plus icon */}
                          <div className="peolple_cat_row_one">
                            {selectedPeople[0]?.tags?.[0] && (
                              <button
                                className="peolple_cat"
                                style={{
                                  backgroundColor: `${selectedPeople[0].tags[0].color}1a`,
                                }}
                              >
                                {selectedPeople[0].tags[0].name}
                              </button>
                            )}
                            {!isShowArchived && (
                              <CustomTooltip arrow title="Add tag">
                                <button
                                  className="peolple_cat_add_btn"
                                  onClick={openTagModal}
                                >
                                  <AddCircleOutlineIcon
                                    style={{ fontSize: 24 }}
                                  />
                                </button>
                              </CustomTooltip>
                            )}
                          </div>

                          {/* Row 2: remaining tags */}
                          {selectedPeople[0]?.tags?.length > 1 && (
                            <div className="peolple_cat_row_two">
                              {selectedPeople[0].tags
                                .slice(1)
                                .map((tag, id) => (
                                  <button
                                    key={id + "tag2"}
                                    className="peolple_cat"
                                    style={{
                                      backgroundColor: tag && `${tag.color}1a`,
                                    }}
                                  >
                                    {tag && tag.name}
                                  </button>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {!isShowArchived && !selectedPeople[0]?.isPotentialMock && (
                      <div className="people_nav_right people_details_more_menu">
                        <button
                          onClick={() => {
                            setIsUserDetailsMenu(true);
                            setShowMenuPopup(true);
                          }}
                          className="more_btn"
                        >
                          <MoreVertIcon className="icon" />
                        </button>
                        {showMenuPopup && isUserDetailsMenu && (
                          <BlurPopup
                            onClose={() => {
                              setShowMenuPopup(false);
                              setIsUserDetailsMenu(false);
                            }}
                            openState={showMenuPopup}
                            ComponentClass="people_nav_popup people_nav_popup_details"
                          >
                            <div className="blurpopup_con_wrapper">
                              {selectedPeople.length < 2 && (
                                <button
                                  onClick={() => {
                                    setShowBooking(true);
                                    setShowMenuPopup(false);
                                  }}
                                >
                                  <EventIcon /> Book meeting
                                </button>
                              )}
                              <CustomTooltip
                                arrow
                                title={
                                  selectedPeople.length > 50 ? (
                                    <>
                                      You can only send emails to
                                      <br /> up to 50 recipients at a time
                                    </>
                                  ) : (
                                    ""
                                  )
                                }
                              >
                                <button
                                  disabled={selectedPeople.length > 50}
                                  onClick={() => {
                                    setShowSendEmail(true);
                                    setShowMenuPopup(false);
                                  }}
                                >
                                  <MailOutlineIcon />
                                  {selectedPeople.length > 1 ? "Group " : ""}
                                  Email
                                </button>
                              </CustomTooltip>
                              <button
                                disabled={
                                  selectedPeople.length > 1 ||
                                  !selectedPeople[0]?.phone
                                }
                                onClick={() =>
                                  handleCallClick(selectedPeople[0])
                                }
                              >
                                <CallIcon />
                                Call
                              </button>
                              <button
                                onClick={() => {
                                  setShowNoteReminder(true);
                                  setShowMenuPopup(false);
                                }}
                              >
                                <EditNoteIcon />
                                Note & reminder
                              </button>
                              {selectedPeople.length < 2 && (
                                <>
                                  <button onClick={handleShareClick}>
                                    <ShareIcon />
                                    Share
                                  </button>
                                  <button
                                    onClick={() => {
                                      setShowMenuPopup(false);
                                      setShowSaveToPhone(true);
                                    }}
                                  >
                                    <SaveIcon />
                                    Save to phone
                                  </button>
                                  <button
                                    onClick={() => {
                                      setScannerInitialData(null);
                                      setShowAddContact(true);
                                      setShowMenuPopup(false);
                                      setIsEditContact(true);
                                    }}
                                  >
                                    <EditIcon />
                                    Edit contact
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => {
                                  setShowConfirmArchived(true);
                                  setShowMenuPopup(false);
                                }}
                              >
                                <ArchiveIcon />
                                Archive
                              </button>
                            </div>
                          </BlurPopup>
                        )}
                      </div>
                    )}
                  </div>
                  {isShowArchived ? (
                    <div
                      className="people_details_nav people_details_nav_special"
                      style={{ justifyContent: "center" }}
                    >
                      <button onClick={delete_contact} style={{ width: "50%" }}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="25"
                          height="24"
                          viewBox="0 0 25 24"
                          fill="none"
                        >
                          <path
                            d="M7.5 21C6.95 21 6.47917 20.8042 6.0875 20.4125C5.69583 20.0208 5.5 19.55 5.5 19V6C5.21667 6 4.97917 5.90417 4.7875 5.7125C4.59583 5.52083 4.5 5.28333 4.5 5C4.5 4.71667 4.59583 4.47917 4.7875 4.2875C4.97917 4.09583 5.21667 4 5.5 4H9.5C9.5 3.71667 9.59583 3.47917 9.7875 3.2875C9.97917 3.09583 10.2167 3 10.5 3H14.5C14.7833 3 15.0208 3.09583 15.2125 3.2875C15.4042 3.47917 15.5 3.71667 15.5 4H19.5C19.7833 4 20.0208 4.09583 20.2125 4.2875C20.4042 4.47917 20.5 4.71667 20.5 5C20.5 5.28333 20.4042 5.52083 20.2125 5.7125C20.0208 5.90417 19.7833 6 19.5 6V19C19.5 19.55 19.3042 20.0208 18.9125 20.4125C18.5208 20.8042 18.05 21 17.5 21H7.5ZM17.5 6H7.5V19H17.5V6ZM10.5 17C10.7833 17 11.0208 16.9042 11.2125 16.7125C11.4042 16.5208 11.5 16.2833 11.5 16V9C11.5 8.71667 11.4042 8.47917 11.2125 8.2875C11.0208 8.09583 10.7833 8 10.5 8C10.2167 8 9.97917 8.09583 9.7875 8.2875C9.59583 8.47917 9.5 8.71667 9.5 9V16C9.5 16.2833 9.59583 16.5208 9.7875 16.7125C9.97917 16.9042 10.2167 17 10.5 17ZM14.5 17C14.7833 17 15.0208 16.9042 15.2125 16.7125C15.4042 16.5208 15.5 16.2833 15.5 16V9C15.5 8.71667 15.4042 8.47917 15.2125 8.2875C15.0208 8.09583 14.7833 8 14.5 8C14.2167 8 13.9792 8.09583 13.7875 8.2875C13.5958 8.47917 13.5 8.71667 13.5 9V16C13.5 16.2833 13.5958 16.5208 13.7875 16.7125C13.9792 16.9042 14.2167 17 14.5 17Z"
                            fill="black"
                          />
                        </svg>
                       Delete
                      </button>
                      <button
                        style={{ width: "50%" }}
                        className="restore_btn icon"
                        onClick={restore_contact}
                      >
                        <RefreshOutlinedIcon />
                        Restore
                      </button>
                    </div>
                  ) : selectedPeople[0]?.isPotentialMock ? (
                    <div
                      className="people_details_nav people_details_nav_special"
                      style={{ justifyContent: "center" }}
                    >
                      <button
                        onClick={handleDeletePotential}
                        style={{ width: "50%" }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="25"
                          height="24"
                          viewBox="0 0 25 24"
                          fill="none"
                        >
                          <path
                            d="M7.5 21C6.95 21 6.47917 20.8042 6.0875 20.4125C5.69583 20.0208 5.5 19.55 5.5 19V6C5.21667 6 4.97917 5.90417 4.7875 5.7125C4.59583 5.52083 4.5 5.28333 4.5 5C4.5 4.71667 4.59583 4.47917 4.7875 4.2875C4.97917 4.09583 5.21667 4 5.5 4H9.5C9.5 3.71667 9.59583 3.47917 9.7875 3.2875C9.97917 3.09583 10.2167 3 10.5 3H14.5C14.7833 3 15.0208 3.09583 15.2125 3.2875C15.4042 3.47917 15.5 3.71667 15.5 4H19.5C19.7833 4 20.0208 4.09583 20.2125 4.2875C20.4042 4.47917 20.5 4.71667 20.5 5C20.5 5.28333 20.4042 5.52083 20.2125 5.7125C20.0208 5.90417 19.7833 6 19.5 6V19C19.5 19.55 19.3042 20.0208 18.9125 20.4125C18.5208 20.8042 18.05 21 17.5 21H7.5ZM17.5 6H7.5V19H17.5V6ZM10.5 17C10.7833 17 11.0208 16.9042 11.2125 16.7125C11.4042 16.5208 11.5 16.2833 11.5 16V9C11.5 8.71667 11.4042 8.47917 11.2125 8.2875C11.0208 8.09583 10.7833 8 10.5 8C10.2167 8 9.97917 8.09583 9.7875 8.2875C9.59583 8.47917 9.5 8.71667 9.5 9V16C9.5 16.2833 9.59583 16.5208 9.7875 16.7125C9.97917 16.9042 10.2167 17 10.5 17ZM14.5 17C14.7833 17 15.0208 16.9042 15.2125 16.7125C15.4042 16.5208 15.5 16.2833 15.5 16V9C15.5 8.71667 15.4042 8.47917 15.2125 8.2875C15.0208 8.09583 14.7833 8 14.5 8C14.2167 8 13.9792 8.09583 13.7875 8.2875C13.5958 8.47917 13.5 8.71667 13.5 9V16C13.5 16.2833 13.5958 16.5208 13.7875 16.7125C13.9792 16.9042 14.2167 17 14.5 17Z"
                            fill="black"
                          />
                        </svg>
                        Discard
                      </button>
                      <button
                        style={{ width: "50%" }}
                        className="restore_btn icon"
                        onClick={openPotentialTagModal}
                      >
                        <RefreshOutlinedIcon />
                        Move to contact
                      </button>
                    </div>
                  ) : (
                    <div className="people_details_nav people_details_nav_actions">
                      <CustomTooltip
                        arrow
                        title={
                          <>
                            You can take a note & add
                            <br /> reminder for smart follow ups
                          </>
                        }
                      >
                        <button
                          onClick={() => {
                            setShowNoteReminder(true);
                            setShowMenuPopup(false);
                          }}
                        >
                          <EditNoteIcon /> Note
                        </button>
                      </CustomTooltip>
                      <CustomTooltip
                        arrow
                        title={
                          <>
                            You can initiate a phone call from <br /> here,
                            provided you are signed in
                            <br /> on your phone
                          </>
                        }
                      >
                        <button
                          onClick={() => handleCallClick(selectedPeople[0])}
                          disabled={
                            selectedPeople.length > 1 ||
                            !selectedPeople[0]?.phone
                          }
                        >
                          <CallIcon /> Call
                        </button>
                      </CustomTooltip>
                      <CustomTooltip
                        arrow
                        title={
                          selectedPeople.length > 50 ? (
                            <>
                              You can only send emails to
                              <br /> up to 50 recipients at a time
                            </>
                          ) : (
                            ""
                          )
                        }
                      >
                        <button
                          disabled={selectedPeople.length > 50}
                          onClick={() => setShowSendEmail(true)}
                        >
                          <MailOutlineIcon /> Email
                        </button>
                      </CustomTooltip>
                      <CustomTooltip
                        arrow
                        placement="bottom-start"
                        title={
                          <>
                            You can book meeting with your
                            <br /> contact using any of your
                            <br /> favourite calendars
                          </>
                        }
                      >
                        <button
                          onClick={() => setShowBooking(true)}
                          className="icon"
                        >
                          <EventIcon />
                          Meeting
                        </button>
                      </CustomTooltip>
                    </div>
                  )}
                  <div className="people_details_timeline_nav">
                    <button
                      className={isAbout ? "" : "active_btn"}
                      onClick={() => setIsAbout(false)}
                    >
                      Timeline
                    </button>
                    <button
                      className={isAbout ? "active_btn" : ""}
                      onClick={() => setIsAbout(true)}
                    >
                      About
                    </button>
                  </div>
                </div>
                <div className="people_details_timeline">
                  {selectedPeople[0]?.isPotentialMock && isAbout ? (
                    <div className="people_details_timeline_about">
                      <span className="timeline_about_priority">
                        Potential Contact
                      </span>
                      <div className="timeline_about_created_date">
                        <p>
                          {selectedPeople[0]?.name} is currently in your
                          potential contacts list.
                        </p>
                      </div>
                      <div className="timeline_about_info">
                        <div className="timeline_about_info_text">
                          <span>
                            <MailOutlineIcon className="MailOutlineIcon" />{" "}
                            Email ID
                          </span>
                          <p>{selectedPeople[0]?.email}</p>
                        </div>
                      </div>
                      <div className="timeline_about_info">
                        <div className="timeline_about_info_text">
                          <span>
                            <CallIcon className="MailOutlineIcon" />
                            Phone number
                          </span>
                          <p>{selectedPeople[0]?.phone}</p>
                        </div>
                      </div>
                      <div className="timeline_about_info">
                        <div className="timeline_about_info_text">
                          <span>
                            <BusinessIcon className="MailOutlineIcon" />
                            Company
                          </span>
                          <p>{selectedPeople[0]?.company}</p>
                        </div>
                      </div>
                    </div>
                  ) : isAbout ? (
                    <div className="people_details_timeline_about">
                      {ContactDetails.priority && (
                        <span className="timeline_about_priority">
                          {ContactDetails.priority} Priority
                        </span>
                      )}
                      {ContactDetails.image && (
                        <img
                          className="timeline_about_img"
                          src={ContactDetails.image}
                          alt="People"
                          loading="lazy"
                        />
                      )}
                      <div className="timeline_about_created_date">
                        <p>
                          {ContactDetails.name} was added to contacts on{" "}
                          {moment(ContactDetails.date_added).calendar()}
                        </p>
                      </div>
                      <div className="timeline_about_info">
                        <div className="timeline_about_info_text">
                          <span>
                            <MailOutlineIcon className="MailOutlineIcon" />{" "}
                            Email ID
                          </span>
                          <p>{ContactDetails.email}</p>
                        </div>
                        <button
                          onClick={() => {
                            copy(ContactDetails.email);
                            setToastText({
                              ...ToastText,
                              text: "Email copied",
                              show: true,
                            });
                          }}
                        >
                          <ContentCopyIcon />
                        </button>
                      </div>
                      {ContactDetails.additional_email && (
                        <div className="timeline_about_info">
                          <div className="timeline_about_info_text">
                            <span>
                              <MailOutlineIcon className="MailOutlineIcon" />{" "}
                              Additional email ID
                            </span>
                            <p>{ContactDetails.additional_email}</p>
                          </div>
                          <button
                            onClick={() => {
                              copy(ContactDetails.additional_email);
                              setToastText({
                                ...ToastText,
                                text: "email copied",
                                show: true,
                              });
                            }}
                          >
                            <ContentCopyIcon />
                          </button>
                        </div>
                      )}
                      {ContactDetails.phone && (
                        <div className="timeline_about_info">
                          <div className="timeline_about_info_text">
                            <span>
                              <CallIcon className="MailOutlineIcon" />
                              Phone number
                            </span>
                            <p>{ContactDetails.phone}</p>
                          </div>
                          <button
                            onClick={() => {
                              copy(ContactDetails.phone);
                              setToastText({
                                ...ToastText,
                                text: "Phone number copied",
                                show: true,
                              });
                            }}
                          >
                            <ContentCopyIcon />
                          </button>
                        </div>
                      )}
                      {ContactDetails.additional_phone && (
                        <div className="timeline_about_info">
                          <div className="timeline_about_info_text">
                            <span>
                              <CallIcon className="MailOutlineIcon" />
                              Additional phone number
                            </span>
                            <p>{ContactDetails.additional_phone}</p>
                          </div>
                          <button
                            onClick={() => {
                              copy(ContactDetails.additional_phone);
                              setToastText({
                                ...ToastText,
                                text: "Number copied",
                                show: true,
                              });
                            }}
                          >
                            <ContentCopyIcon />
                          </button>
                        </div>
                      )}
                      {ContactDetails.birthday && (
                        <div className="timeline_about_info">
                          <div className="timeline_about_info_text">
                            <span>
                              <CakeOutlined className="MailOutlineIcon" />
                              Birthday
                            </span>
                            <p>
                              {moment(ContactDetails.birthday).format(
                                "Do MMM YYYY",
                              )}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              copy(
                                moment(ContactDetails.birthday).format(
                                  "Do MMM YYYY",
                                ),
                              );
                              setToastText({
                                ...ToastText,
                                text: "Birthday copied",
                                show: true,
                              });
                            }}
                          >
                            <ContentCopyIcon />
                          </button>
                        </div>
                      )}
                      {ContactDetails.address && (
                        <div className="timeline_about_info">
                          <div className="timeline_about_info_text">
                            <span>
                              <HomeOutlined className="MailOutlineIcon" />
                              Address
                            </span>
                            <p>{ContactDetails.address}</p>
                          </div>
                          <button
                            onClick={() => {
                              copy(ContactDetails.address);
                              setToastText({
                                ...ToastText,
                                text: "Address copied",
                                show: true,
                              });
                            }}
                          >
                            <ContentCopyIcon />
                          </button>
                        </div>
                      )}
                      {ContactDetails.about && (
                        <div className="timeline_about_info">
                          <div className="timeline_about_info_text">
                            <span>
                              <EditNoteIcon className="MailOutlineIcon" />
                              About
                            </span>
                            <p>{ContactDetails.about}</p>
                          </div>
                          <button
                            onClick={() => {
                              copy(ContactDetails.about);
                              setToastText({
                                ...ToastText,
                                text: "About copied",
                                show: true,
                              });
                            }}
                          >
                            <ContentCopyIcon />
                          </button>
                        </div>
                      )}
                      {ContactDetails.designation && (
                        <div className="timeline_about_info">
                          <div className="timeline_about_info_text">
                            <span>
                              <AccountCircleIcon className="MailOutlineIcon" />
                              Designation
                            </span>
                            <p>{ContactDetails.designation}</p>
                          </div>
                          <button
                            onClick={() => {
                              copy(ContactDetails.designation);
                              setToastText({
                                ...ToastText,
                                text: "Designation copied",
                                show: true,
                              });
                            }}
                          >
                            <ContentCopyIcon />
                          </button>
                        </div>
                      )}
                      {ContactDetails.company && (
                        <div className="timeline_about_info">
                          <div className="timeline_about_info_text">
                            <span>
                              <BusinessIcon className="MailOutlineIcon" />
                              Company
                            </span>
                            <p>{ContactDetails.company}</p>
                          </div>
                          <button
                            onClick={() => {
                              copy(ContactDetails.company);
                              setToastText({
                                ...ToastText,
                                text: "Company copied",
                                show: true,
                              });
                            }}
                          >
                            <ContentCopyIcon />
                          </button>
                        </div>
                      )}
                      {ContactDetails.social_links &&
                        ContactDetails.social_links.length > 0 &&
                        ContactDetails.social_links.map(
                          (link, id) =>
                            link && (
                              <div
                                key={id + "social"}
                                className="timeline_about_info"
                              >
                                <div className="timeline_about_info_text">
                                  <span>
                                    <LinkOutlinedIcon className="MailOutlineIcon" />
                                    Social media, websites, etc
                                  </span>
                                  <p>{link}</p>
                                </div>
                                <button
                                  onClick={() => {
                                    copy(link);
                                    setToastText({
                                      ...ToastText,
                                      text: "Link copied",
                                      show: true,
                                    });
                                  }}
                                >
                                  <ContentCopyIcon />
                                </button>
                              </div>
                            ),
                        )}
                    </div>
                  ) : (
                    <Timeline
                      selectedPeople={selectedPeople[0]}
                      noteAdded={noteAdded}
                      isShowArchived={isShowArchived}
                      isShowPotential={isShowPotential}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="people_details_multiple">
                <button
                  onClick={() => setContactCliked(false)}
                  className="back_btn"
                >
                  <ArrowBackIcon fontSize="small" /> Back
                </button>
                <div className="people_avatar_wrapper">
                  {selectedPeople.map((item, index) =>
                    item.image ? (
                      <img
                        className="person_image_main"
                        src={item.image}
                        alt="person_image"
                        loading="lazy"
                        key={index}
                      />
                    ) : (
                      <button
                        style={{
                          backgroundColor: `${item.image_color}33`,
                          color: item.image_color,
                        }}
                        className="people_avatar"
                        key={index + "people_avatar"}
                      >
                        {item.name.charAt(0)}
                      </button>
                    ),
                  )}
                </div>
                <h2>
                  {selectedPeople[0]?.name +
                    " + " +
                    (selectedPeople.length - 1)}
                </h2>
                {isShowArchived ? (
                  <div
                    className="people_details_nav people_details_nav_actions"
                    style={{ justifyContent: "center", display: "flex" }}
                  >
                    <button
                      onClick={() => {
                        setShowNoteReminder(true);
                        setShowMenuPopup(false);
                      }}
                      style={{ width: "50%" }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="25"
                        height="24"
                        viewBox="0 0 25 24"
                        fill="none"
                      >
                        <path
                          d="M7.5 21C6.95 21 6.47917 20.8042 6.0875 20.4125C5.69583 20.0208 5.5 19.55 5.5 19V6C5.21667 6 4.97917 5.90417 4.7875 5.7125C4.59583 5.52083 4.5 5.28333 4.5 5C4.5 4.71667 4.59583 4.47917 4.7875 4.2875C4.97917 4.09583 5.21667 4 5.5 4H9.5C9.5 3.71667 9.59583 3.47917 9.7875 3.2875C9.97917 3.09583 10.2167 3 10.5 3H14.5C14.7833 3 15.0208 3.09583 15.2125 3.2875C15.4042 3.47917 15.5 3.71667 15.5 4H19.5C19.7833 4 20.0208 4.09583 20.2125 4.2875C20.4042 4.47917 20.5 4.71667 20.5 5C20.5 5.28333 20.4042 5.52083 20.2125 5.7125C20.0208 5.90417 19.7833 6 19.5 6V19C19.5 19.55 19.3042 20.0208 18.9125 20.4125C18.5208 20.8042 18.05 21 17.5 21H7.5ZM17.5 6H7.5V19H17.5V6ZM10.5 17C10.7833 17 11.0208 16.9042 11.2125 16.7125C11.4042 16.5208 11.5 16.2833 11.5 16V9C11.5 8.71667 11.4042 8.47917 11.2125 8.2875C11.0208 8.09583 10.7833 8 10.5 8C10.2167 8 9.97917 8.09583 9.7875 8.2875C9.59583 8.47917 9.5 8.71667 9.5 9V16C9.5 16.2833 9.59583 16.5208 9.7875 16.7125C9.97917 16.9042 10.2167 17 10.5 17ZM14.5 17C14.7833 17 15.0208 16.9042 15.2125 16.7125C15.4042 16.5208 15.5 16.2833 15.5 16V9C15.5 8.71667 15.4042 8.47917 15.2125 8.2875C15.0208 8.09583 14.7833 8 14.5 8C14.2167 8 13.9792 8.09583 13.7875 8.2875C13.5958 8.47917 13.5 8.71667 13.5 9V16C13.5 16.2833 13.5958 16.5208 13.7875 16.7125C13.9792 16.9042 14.2167 17 14.5 17Z"
                          fill="black"
                        />
                      </svg>
                      Delete
                    </button>
                    <button
                      style={{ width: "50%" }}
                      className="restore_btn icon"
                      onClick={restore_contact}
                    >
                      <RefreshOutlinedIcon />
                      Restore
                    </button>
                  </div>
                ) : (
                  <div className="people_details_nav">
                    <CustomTooltip
                      arrow
                      title={
                        <>
                          You can take a note & add
                          <br /> reminder for smart follow ups
                        </>
                      }
                    >
                      <button
                        onClick={() => {
                          setShowNoteReminder(true);
                          setShowMenuPopup(false);
                        }}
                      >
                        <EditNoteIcon /> Note
                      </button>
                    </CustomTooltip>
                    <CustomTooltip
                      arrow
                      title={
                        selectedPeople.length > 50 ? (
                          <>
                            You can only send emails to
                            <br /> up to 50 recipients at a time
                          </>
                        ) : (
                          <>
                            You can mail to multiple <br /> contacts, yet keep
                            it personal
                          </>
                        )
                      }
                    >
                      <button
                        disabled={selectedPeople.length > 50}
                        onClick={() => setShowSendEmail(true)}
                      >
                        <MailOutlineIcon /> Email
                      </button>
                    </CustomTooltip>
                    <CustomTooltip
                      arrow
                      title={
                        <>
                          You can mail to multiple <br /> contacts, yet keep it
                          personal
                        </>
                      }
                    >
                      <button
                        className="icon"
                        onClick={() => setShowConfirmArchived(true)}
                      >
                        <ArchiveIcon /> Archive
                      </button>
                    </CustomTooltip>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      {showTagModal && renderTagModal()}
      {showPotentialTagModal && renderPotentialTagModal()}

      {showBooking && (
        <BlurPopup
          onClose={() => setShowBooking(false)}
          openState={showBooking}
          ComponentClass="booking_integration_popup"
        >
          <div className="blurpopup_con_wrapper booking_integration_popup_wrapper">
            <BookingIntegration
              onClose={() => setShowBooking(false)}
              selectedPeople={selectedPeople[0]}
              handleTimelineRefresh={handleTimelineRefresh}
            />
          </div>
        </BlurPopup>
      )}
      {showConfirmArchived && (
        <BlurPopup
          onClose={() => setShowConfirmArchived(false)}
          openState={showConfirmArchived}
        >
          <div className="blurpopup_con_wrapper archived_confirm_popup">
            <h3>Do you really want to archive?</h3>
            <LazyLoadImage
              src={no_people_img}
              wrapperClassName="archived_img"
            />
            <div className="archived_confirm_btns">
              <button
                onClick={() => setShowConfirmArchived(false)}
                className="btn-outline"
              >
                No
              </button>
              <button onClick={archive_contact} className="btn-primary">
                {!isArchivingContact ? (
                  "Yes, archive"
                ) : (
                  <ThreeDots
                    height="25"
                    width="60"
                    radius="9"
                    color="white"
                    ariaLabel="three-dots-loading"
                  />
                )}
              </button>
            </div>
          </div>
        </BlurPopup>
      )}
      {showSendEmail && (
        <BlurPopup
          onClose={() => setShowSendEmail(false)}
          openState={showSendEmail}
          ComponentClass="people_sendemail_popup_wrapper"
        >
          <div className="blurpopup_con_wrapper people_sendemail_popup">
            <SendEmail
              selectedPeople={selectedPeople}
              handleCLose={() => setShowSendEmail(false)}
              handleTimelineRefresh={handleTimelineRefresh}
            />
          </div>
        </BlurPopup>
      )}
      {showAddContact && (
        <BlurPopup onClose={handleCloseAddContact} openState={showAddContact}>
          <div className="blurpopup_con_wrapper people_add_contact_popup">
            <AddContact
              handleAddContact={handleAddContact}
              handleUpdateContact={handleUpdateContact}
              handleCLose={handleCloseAddContact}
              selectedPeople={selectedPeople[0]}
              isEdit={isEditContact}
              handleTimelineRefresh={handleTimelineRefresh}
              people_count={contactList.length}
              initialData={scannerInitialData}
            />
          </div>
        </BlurPopup>
      )}
      {showBusinessCardScanner && (
        <BusinessCardScanner
          openState={showBusinessCardScanner}
          onClose={() => setShowBusinessCardScanner(false)}
          onScanSuccess={handleBusinessCardScanSuccess}
          isMobile={isMobile}
        />
      )}
      {showNoteReminder && (
        <BlurPopup
          onClose={() => setShowNoteReminder(false)}
          openState={showNoteReminder}
          ComponentClass="note_and_reminder_popup_wrapper"
        >
          <div className="blurpopup_con_wrapper note_and_reminder_popup">
            <NoteAndReminder
              selectedPeople={selectedPeople}
              handleCLose={() => setShowNoteReminder(false)}
              handleTimelineRefresh={handleTimelineRefresh}
            />
          </div>
        </BlurPopup>
      )}
      {showSaveToPhone && (
        <BlurPopup
          onClose={() => setShowSaveToPhone(false)}
          openState={showSaveToPhone}
        >
          <div className="blurpopup_con_wrapper people_save_contact_popup_wrapper">
            <SaveToPhone
              selectedPeople={selectedPeople[0]}
              handleCLose={() => setShowSaveToPhone(false)}
            />
          </div>
        </BlurPopup>
      )}
      <BottomBar />
    </div>
  );
}

export default People;
