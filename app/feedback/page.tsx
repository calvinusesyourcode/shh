"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button";

export default function FeedbackCard() {
  const feedbackTypes = [
    "featureRequest", "bugReport", "comment"
  ]
  const defaultTextPlaceholder = "// be descriptive!"
    const params = useSearchParams()
    const [a, sA] = useState<string | null>(null)
    const [feedbackType, setFeedbackType] = useState<string | null>(null)
    const [email, setEmail] = useState<string | null>(null)
    const [text, setText] = useState<string | null>(null)
    const [textPlaceholder, setTextPlaceholder] = useState<string | null>(defaultTextPlaceholder)

    
    useEffect(() => {
        setFeedbackType(params.get("feedbackType"))
    }, [])

    useEffect(() => {
      switch (feedbackType) {
        case "featureRequest":
          setTextPlaceholder("// how exactly would this improve user experience? // what made you think of this? // how long have you been using the app?")
          break
        case "bugReport":
          setTextPlaceholder("// please recount exactly how and when bug occured")
          break
        case "comment":
          setTextPlaceholder("// hello beautiful user! write here what you would like to say.")
          break
        default:
          setTextPlaceholder(defaultTextPlaceholder)
      }
    }, [feedbackType])

    return (
        <>
        <Card className="m-4">
          <CardHeader>
            <CardTitle>feedback form</CardTitle>
            <CardDescription className="text-muted-foreground">actually just email c@calvin.art, form is not working</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-end gap-4">
            <Label>Type*</Label>
            <Select onValueChange={(value) => {setFeedbackType(value)}}>
              <SelectTrigger className="max-w-[260px]">
                <SelectValue placeholder={feedbackType} />
              </SelectTrigger>
              <SelectContent>
                {feedbackTypes.map((item, i) => (
                  <SelectItem key={i} value={item}>{item}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
                  </div>
            <div className="flex items-center justify-end gap-4">
              <Label htmlFor="emailInput" >Email</Label>
              <Input className="max-w-[260px]" id="emailInput" value={email as string} placeholder={"user@example.com"} onChange={(event) => {setEmail(event.target.value)}}/>
            </div>
              <Textarea className="min-h-[120px]" id="emailInput" value={text as string} placeholder={textPlaceholder as string} onChange={(event) => {setText(event.target.value)}}/>
            <div className="flex justify-end">
                  <Button disabled={true}>Submit</Button>
            </div>
          </CardContent>
        </Card>

        </>
    )
}

export function FeedbackDialog() {
  return (
    <>
      <Dialog>
        <DialogTrigger className="m-4"><Button>feedback</Button></DialogTrigger>
        <DialogContent>
          <FeedbackCard />
        </DialogContent>
      </Dialog>
    </>
  )
}