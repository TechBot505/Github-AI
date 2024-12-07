'use client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { uploadFile } from '@/lib/firebase';
import { Presentation, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

const MeetingCard = () => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            'audio/*': ['.mp3', '.wav', '.m4a'],
        },
        multiple: false,
        maxSize: 50000000,
        onDrop: async (acceptedFiles) => {
            setUploading(true); 
            console.log(acceptedFiles);
            const file = acceptedFiles[0];
            const downloadUrl = await uploadFile(file as File, setProgress);
            setUploading(false);
        },
    });
    return (
        <Card className='flex flex-col items-center justify-center col-span-2' {...getRootProps()}>
            {!uploading && (
                <>
                    <Presentation className='h-10 w-10 animate-bounce' />
                    <h3 className='mt-2 text-sm font-semibold text-gray-900'>
                        Create a new Meeting
                    </h3>
                    <p className='mt-1 text-center text-sm text-gray-500'>
                        Analyze your meetings with Github AI
                    </p>
                    <div className="mt-6">
                        <Button disabled={uploading}>
                            <Upload className='-ml-0.5 backdrop:h-5 w-5 mr-1.5' aria-hidden="true"/>
                            Upload Meeting
                            <input className='hidden' {...getInputProps()} />
                        </Button>
                    </div>
                </>
            )}
            {uploading && (
                
            )}
        </Card>
    )
}

export default MeetingCard;