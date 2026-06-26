import { Fragment } from "react";
import Link from "next/link";
import { Folder } from "../api/document-api";
import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface DriveBreadcrumbProps {
  path: Folder[];
  isSearch?: boolean;
}

export function DriveBreadcrumb({ path, isSearch }: DriveBreadcrumbProps) {
  return (
    <Breadcrumb className="pb-4 border-b mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard/documents" className="flex items-center">
              <Home className="h-4 w-4 mr-1" />
              Root
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {path.map((folder, index) => {
          const isLast = index === path.length - 1 && !isSearch;
          return (
            <Fragment key={folder.id}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{folder.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={`/dashboard/documents?folder_id=${folder.id}`}>
                      {folder.name}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}

        {isSearch && (
          <Fragment>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Hasil Pencarian</BreadcrumbPage>
            </BreadcrumbItem>
          </Fragment>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
