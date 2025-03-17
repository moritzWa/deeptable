import { error } from 'console';
import { Button, Card, CardHeader, CardTitle } from 'react-bootstrap';
import { AppLayout } from "./AppLayout";
import { CardContent } from './ui/card';
import { useNavigate } from 'react-router-dom';

export const TablePageError = ({ error }: { error: string }) => {
  const navigate = useNavigate();
  return (
    <AppLayout>
    <div className="max-w-4xl">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-red-500">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <Button 
            onClick={() => navigate("/home")} 
            className="mt-4"
          >
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  </AppLayout>
  );
};