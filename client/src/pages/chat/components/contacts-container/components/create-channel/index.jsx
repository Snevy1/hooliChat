import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { CREATE_CHANNEL_ROUTE, GET_ALL_CONTACTS_ROUTES } from "@/utils/constants";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/button";
import MultipleSelector from "@/components/ui/multipleselect";

const CreateChannel = () => {
  const { setSelectedChatType, setSelectChatData, addChannel } = useAppStore();
  const [newChannelModal, setNewChannelModal] = useState(false);
  const [allContacts, setAllContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [channelName, setChannelName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      const fetchContacts = async () => {
          try {
              const response = await apiClient.get(GET_ALL_CONTACTS_ROUTES, { withCredentials: true });
              setAllContacts(response.data.contacts);
          } catch (error) {
              console.error("Error fetching contacts:", error);
          }
      };
      fetchContacts();
  }, []);

  const createChannel = async () => {
      if (!channelName.trim() || selectedContacts.length === 0) return;
      setLoading(true);
      try {
          const response = await apiClient.post(
              CREATE_CHANNEL_ROUTE,
              {
                  name: channelName.trim(),
                  members: selectedContacts.map((contact) => contact.value),
              },
              { withCredentials: true }
          );

          if (response.status === 201) {
              setChannelName("");
              setSelectedContacts([]);
              setNewChannelModal(false);
              addChannel(response.data.channel);
          }
      } catch (error) {
          console.error("Error creating channel:", error);
      } finally {
          setLoading(false);
      }
  };

  return (
      <>
          <TooltipProvider>
              <Tooltip>
                  <TooltipTrigger>
                      <FaPlus
                          className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300"
                          onClick={() => setNewChannelModal(true)}
                      />
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3 text-white">
                      Create New Channel
                  </TooltipContent>
              </Tooltip>
          </TooltipProvider>

          <Dialog open={newChannelModal} onOpenChange={setNewChannelModal}>
              <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col gap-4">
                  <DialogHeader>
                      <DialogTitle>Create a New Channel</DialogTitle>
                      <DialogDescription>Fill in the details below</DialogDescription>
                  </DialogHeader>

                  <Input
                      placeholder="Channel Name"
                      className="rounded-lg p-6 bg-[#2c2e3b] border-none"
                      onChange={(e) => setChannelName(e.target.value)}
                      value={channelName}
                  />

                  <MultipleSelector
                      className="rounded-lg bg-[#2c2e3b] border-none py-2 text-white w-full"
                      defaultOptions={allContacts}
                      placeholder="Search Contacts"
                      value={selectedContacts}
                      onChange={setSelectedContacts}
                      emptyIndicator={<p className="text-center text-lg leading-10 text-gray-600">No results found.</p>}
                  />

                  <Button
                      className="w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300"
                      onClick={createChannel}
                      disabled={loading}
                  >
                      {loading ? "Creating..." : "Create Channel"}
                  </Button>
              </DialogContent>
          </Dialog>
      </>
  );
};

export default CreateChannel;
