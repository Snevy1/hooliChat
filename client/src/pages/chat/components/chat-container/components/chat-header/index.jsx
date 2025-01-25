import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import { RiCloseFill } from "react-icons/ri";
import { FaUserPlus } from "react-icons/fa";
import { apiClient } from "@/lib/api-client";
import {
  CREATE_CHANNEL_ROUTE,
  GET_ALL_CONTACTS_ROUTES,
} from "@/utils/constants";
import MultipleSelector from "@/components/ui/multipleselect";
import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ChatHeader = () => {
  const { closeChat, selectedChatData, selectedChatType } = useAppStore();
  const [allContacts, setAllContacts] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const modalRef = useRef(null); // Ref to detect outside clicks

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await apiClient.get(GET_ALL_CONTACTS_ROUTES, {
          withCredentials: true,
        });
        setAllContacts(response.data.contacts);
      } catch (error) {
        console.error("Failed to fetch contacts:", error);
      }
    };
    getData();
  }, []);

  // Function to handle adding members
  const handleAddMembers = async () => {
    console.log("Adding members:", selectedMembers);

    try {
      if (selectedMembers.length > 0) {
        const response = await apiClient.post(
          CREATE_CHANNEL_ROUTE,
          {
            name: selectedChatData.name,
            members: selectedMembers.map((contact) => contact.value),
          },
          { withCredentials: true }
        );

        if (response.status === 201) {
          setSelectedMembers([]); // ✅ Clear selected members
          setShowAddMemberModal(false); // ✅ Close modal properly
        }
      }
    } catch (error) {
      console.error("Error adding members:", error);
    }

    setShowAddMemberModal(false);
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowAddMemberModal(false);
      }
    };

    if (showAddMemberModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAddMemberModal]);

  return (
    <div className="h-[10vh] border-b-2 border-[#2f303b] flex items-center justify-between px-20">
      <div className="flex gap-5 items-center w-full justify-between">
        <div className="flex gap-3 items-center justify-center">
          <div className="w-12 h-12 relative">
            {selectedChatType === "contact" ? (
              <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                {selectedChatData.image ? (
                  <AvatarImage
                    src={`${HOST}/${selectedChatData.image}`}
                    alt="profile"
                    className="object-cover w-full h-full bg-black"
                  />
                ) : (
                  <div
                    className={`uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                      selectedChatData.color
                    )}`}
                  >
                    {selectedChatData.firstName
                      ? selectedChatData.firstName.charAt(0)
                      : selectedChatData.email.charAt(0)}
                  </div>
                )}
              </Avatar>
            ) : (
              <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full">
                #
              </div>
            )}
          </div>
          <div>
            {selectedChatType === "channel" && selectedChatData.name}
            {selectedChatType === "contact" &&
              (selectedChatData.firstName
                ? `${selectedChatData.firstName} ${selectedChatData.lastName}`
                : selectedChatData.email)}
          </div>
        </div>
        <div className="flex items-center justify-center gap-5">
          {selectedChatType === "channel" && (
            <button
              className="text-neutral-500 hover:text-white transition-all duration-300"
              onClick={() => setShowAddMemberModal(true)}
              title="Add Member"
            >
              <FaUserPlus className="text-2xl" />
            </button>
          )}
          <button
            className="text-neutral-500 hover:text-white transition-all duration-300"
            onClick={closeChat}
          >
            <RiCloseFill className="text-3xl" />
          </button>
        </div>
      </div>

      {/* Add Members Modal */}
      <Dialog open={showAddMemberModal} onOpenChange={setShowAddMemberModal}>
        <DialogContent
          ref={modalRef}
          className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col"
        >
          <DialogHeader>
            <DialogTitle>Add Members to {selectedChatData.name}</DialogTitle>
            <DialogDescription>
              Select contacts to add to the group
            </DialogDescription>
          </DialogHeader>

          {/* Multiple Selector for Adding Members */}
          <MultipleSelector
            key={selectedMembers.length} // ✅ Force re-render on selection
            className="rounded-lg bg-[#2c2e3b] border-none py-2 text-white w-full"
            defaultOptions={allContacts}
            placeholder="Search Contacts"
            value={selectedMembers}
            onChange={(selected) => {
              setSelectedMembers(selected); // ✅ Update selection
            }}
            emptyIndicator={
              <p className="text-center text-lg leading-10 text-gray-600">
                No results found.
              </p>
            }
          />

          {/* Add Members Button */}
          <Button
            className="w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300 mt-4"
            onClick={handleAddMembers}
          >
            Add Members
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatHeader;
