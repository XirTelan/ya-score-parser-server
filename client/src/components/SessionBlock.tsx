import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./ui/accordion";
import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const SessionBlock = () => {
  const [sessionToken, setSessionToken] = useState("");
  const { toast } = useToast();

  async function updateSessionId(data: string) {
    try {
      const res = await fetch(`${BACKEND_URL}/session`, {
        method: "POST",
        body: JSON.stringify({
          name: "sessionId",
          value: data,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        toast({
          title: "SessionId",
          description: "Updated ",
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    async function getSession() {
      try {
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
        if (!BACKEND_URL) throw new Error("BACKEND_URL is empty");
        const res = await fetch(`${BACKEND_URL}/session`);
        if (res.ok) {
          const data: Session = await res.json();
          setSessionToken(data.value);
        }
      } catch (error) {
        console.error(error);
      }
    }
    getSession();
  }, [setSessionToken]);

  return (
    <div>
      <Card className=" px-4 py-2">
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger value="item-1">
              <span
                className={`${
                  sessionToken ? "text-green-500" : "text-red-500 "
                }`}
              >
                SESSION_ID
              </span>{" "}
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex gap-4 m-4">
                <Input
                  value={sessionToken ?? ""}
                  onChange={(e) => setSessionToken(e.target.value)}
                />
                <Button
                  type="button"
                  onClick={() => updateSessionId(sessionToken)}
                >
                  Update
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    </div>
  );
};

export default SessionBlock;

type Session = {
  createdAt: Date;
  updatedAt: Date;
  name: string;
  value: string;
};
