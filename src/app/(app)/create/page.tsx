import { PenTool } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreatePage() {
  return (
    <Card className="bg-card/80">
      <CardHeader>
        <div className="mb-3 grid size-11 place-items-center rounded-lg bg-amber-500/15 text-amber-100">
          <PenTool className="size-5" />
        </div>
        <CardTitle>Create</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Создание упражнений будет подключено следующим roadmap-срезом.
        </p>
      </CardContent>
    </Card>
  );
}
