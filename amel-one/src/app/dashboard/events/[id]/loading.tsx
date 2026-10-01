import {Skeleton} from "@/components/ui/skeleton";
export default function Loading(){return <main id="main" className="dashboard-main" aria-busy="true" aria-label="Loading event"><p role="status">Getting your event ready…</p><div className="form-stack" style={{marginTop:32}}><Skeleton className="h-10 w-2/3"/><Skeleton className="h-14 w-full"/><Skeleton className="h-80 w-full"/></div></main>;}

