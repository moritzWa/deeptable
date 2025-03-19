import { useNavigate } from 'react-router-dom';
import { AppLayout } from "./AppLayout";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export const TablePageError = ({ error }: { error: string }) => {
  const navigate = useNavigate();
  return (
    <AppLayout>
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button 
              onClick={() => navigate("/home")} 
              className="w-full"
              variant="default"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};