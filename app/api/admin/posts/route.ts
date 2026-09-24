import { POST as studioPost } from "../../studio/[...path]/route";
export async function POST(request:Request){return studioPost(request,{params:Promise.resolve({path:["post"]})});}
