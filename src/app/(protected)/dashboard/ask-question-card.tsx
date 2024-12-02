'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useProject from "@/hooks/use-project";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DialogHeader } from "@/components/ui/dialog";
import { GithubIcon } from "lucide-react";
import { askQuestion } from "./actions";
import { readStreamableValue } from "ai/rsc";
import MDEditor from "@uiw/react-md-editor";

const AskQuestionCard = () => {
    const { project } = useProject();
    const [question, setQuestion] = useState<string>('');
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [filesReferenced, setFilesReferenced] = useState<{ fileName: string, sourceCode: string, summary: string }[]>([]);
    const [answer, setAnswer] = useState<string>('');

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setAnswer('');
        setFilesReferenced([]);
        e.preventDefault();
        if(!project?.id) return;
        setLoading(true);
        const { output, filesReferenced } = await askQuestion(question, project.id);
        setOpen(true);
        setFilesReferenced(filesReferenced);
        for await (const delta of readStreamableValue(output)) {
            if(delta) {
                setAnswer(ans => ans + delta);
            }
        }
        setLoading(false);
    }
    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[80vw]">
                    <DialogHeader>
                        <DialogTitle>
                        <GithubIcon className="bg-black text-white rounded-full p-1" size={30}/>
                        </DialogTitle>
                    </DialogHeader>
                    <MDEditor.Markdown source={answer} className="max-w-[70vw] h-full max-h-[40vh] overflow-scroll"/>
                    <Button type="button" onClick={() => {setOpen(false)}}>
                        Close
                    </Button>
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
                        <Button type="submit" disabled={loading}>
                            Ask Github AI
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </>
    )
}

export default AskQuestionCard