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
import CodeReferences from "./file-references";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";

const AskQuestionCard = () => {
    const { project } = useProject();
    const [question, setQuestion] = useState<string>('');
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [filesReferences, setFilesReferences] = useState<{ fileName: string, sourceCode: string, summary: string }[]>([]);
    const [answer, setAnswer] = useState<string>('');
    const saveAnswer = api.project.saveAnswer.useMutation();

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setAnswer('');
        setFilesReferences([]);
        e.preventDefault();
        if(!project?.id) return;
        setLoading(true);
        const { output, filesReferences } = await askQuestion(question, project.id);
        setOpen(true);
        setFilesReferences(filesReferences);
        for await (const delta of readStreamableValue(output)) {
            if(delta) {
                setAnswer(ans => ans + delta);
            }
        }
        setLoading(false);
    }

    const refetch = useRefetch();

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[80vw]">
                    <DialogHeader>
                        <div className="flex gap-4 items-center">
                            <DialogTitle>
                                <GithubIcon className="bg-black text-white rounded-full p-1" size={32}/>
                            </DialogTitle>
                            <Button disabled={saveAnswer.isPending} variant={'outline'} onClick={() => {
                                saveAnswer.mutate({
                                    projectId: project!.id,
                                    question,
                                    answer,
                                    filesReferences
                                }, {
                                    onSuccess: () => {
                                        toast.success('Answer saved successfully');
                                        refetch();
                                    }
                                })
                            }}>
                                Save Answer
                            </Button>
                        </div>
                    </DialogHeader>
                    <div className="flex flex-col items-center">
                    <MDEditor.Markdown source={answer} className="max-w-[70vw] max-h-[35vh] overflow-scroll"/>
                    <div className="h-4"></div>
                    <CodeReferences fileReferences={filesReferences}/>
                    </div>
                    <Button className="w-[70vw] mx-auto" type="button" onClick={() => {setOpen(false)}}>
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