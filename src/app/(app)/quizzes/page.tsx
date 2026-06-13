import { LibraryBig } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function QuizzesPage() {
  return (
    <Card className="bg-card/80">
      <CardHeader>
        <div className="mb-3 grid size-11 place-items-center rounded-lg bg-sky-500/15 text-sky-200">
          <LibraryBig className="size-5" />
        </div>
        <CardTitle>Quizzes</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Здесь появится каталог квизов после onboarding-среза.
        </p>
      </CardContent>
    </Card>
  );
}
