import { Card, CardContent, Box, Typography, Skeleton } from "@mui/material";
import type { ReactNode } from "react";

interface Props {
  title: string;
  value: string | number;
  icon?: ReactNode;
  color?: string;
  loading?: boolean;
}

export default function StatCard({ title, value, icon, color = "#3949ab", loading }: Props) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {icon && (
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                bgcolor: `${color}1a`,
                color,
              }}
            >
              {icon}
            </Box>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" color="text.secondary" noWrap>
              {title}
            </Typography>
            {loading ? (
              <Skeleton width={90} height={32} />
            ) : (
              <Typography variant="h5" noWrap>
                {value}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
