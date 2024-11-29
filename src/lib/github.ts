import { db } from '@/server/db';
import { Octokit } from 'octokit';
import axios from 'axios';
import { getCommitSummary } from './gemini';

export const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

type Response = {
    hash: string;
    message: string;
    authorName: string;
    authorAvatar: string;
    date: string;
}

export const getCommitHashes = async (githubUrl: string): Promise<Response[]> => {
    const [owner, repo] = githubUrl.split('/').slice(-2);
    if(!owner || !repo) {
        throw new Error('Invalid github url');
    }
    const {data} = await octokit.rest.repos.listCommits({
        owner,
        repo
    })
    const sortedCommits = data.sort((a: any, b: any) => new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime()) as any[];
    return sortedCommits.slice(0, 10).map((commit: any) => ({
        hash: commit.sha as string,
        message: commit.commit.message ?? "",
        authorName: commit.commit?.author?.name ?? "",
        authorAvatar: commit?.author?.avatar_url ?? "",
        date: commit?.commit?.author?.date ?? ""
    }));
}

export const pollCommits = async (projectId: string) => {
    const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
    const commitHashes = await getCommitHashes(githubUrl);
    const unprocessedCommits = await fileterUnprocessedCommits(projectId, commitHashes);
    const summaryResponses = await Promise.allSettled(unprocessedCommits.map((commit) => {
        return summariseCommit(githubUrl, commit.hash);
    }));
    const summaries = summaryResponses.map((response) => {
        if(response.status === 'fulfilled') {
            return response.value as string;
        }
        return "";
    });
    const commits = await db.commit.createMany({
        data: summaries.map((summary, index) => {
            console.log(`processing commit ${index}`);
            return {
                projectId: projectId,
                hash: unprocessedCommits[index]!.hash,
                message: unprocessedCommits[index]!.message,
                authorName: unprocessedCommits[index]!.authorName,
                authorAvatar: unprocessedCommits[index]!.authorAvatar,
                date: unprocessedCommits[index]!.date,
                summary
            }
        })
    })
    return commits;
}

async function summariseCommit(githubUrl: string, commitHash: string) {
    const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
        headers: {
            Accept: 'application/vnd.github.v3.diff'
        }
    });
    return await getCommitSummary(data) || "";
}

async function fetchProjectGithubUrl(projectId: string) {
    const project = await db.project.findUnique({
        where: { id: projectId },
        select: { githubUrl: true }
    })
    if(!project?.githubUrl) {
        throw new Error('Project does not have a github url');
    }
    return {project, githubUrl: project?.githubUrl};
}

async function fileterUnprocessedCommits(projectId: string, commitHashes: Response[]) {
    const processedCommits = await db.commit.findMany({
        where: { projectId }
    });
    const unprocessedCommits = commitHashes.filter((commit) => !processedCommits.some((processedCommit) => processedCommit.hash === commit.hash));
    return unprocessedCommits;
}