'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useProject from "@/hooks/use-project";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { DialogHeader } from "@/components/ui/dialog";
import { GithubIcon } from "lucide-react";

const AskQuestionCard = () => {
    const { project } = useProject();
    const [question, setQuestion] = useState<string>('');
    const [open, setOpen] = useState<boolean>(false);
    
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setOpen(true);
    }
    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                        <GithubIcon className="bg-black text-white rounded-full p-1" size={30}/>
                        </DialogTitle>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

            <Card className="relative col-span-3">
                <CardHeader>
                    <CardTitle>Ask a Question</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit}>
                        <Textarea
                            placeholder="Which file should I edit to change the Home page?"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                        />
                        <div className="h-4"></div>
                        <Button type="submit">
                            Ask Github AI
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </>
    )
}

export default AskQuestionCard