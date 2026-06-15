import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useAskInsight } from "../hooks/useEmployees";

const EXAMPLES = [
  "Which department has the highest average salary?",
  "What is the total payroll cost in India?",
  "Show top 5 paid employees in Engineering",
  "What is the average salary in Germany?",
  "How many employees are in Sales?",
];

export default function AIInsights() {
  const [question, setQuestion] = useState("");
  const ask = useAskInsight();
  const result = ask.data;

  const run = (q?: string) => {
    const text = (q ?? question).trim();
    if (!text) return;
    setQuestion(text);
    ask.mutate(text);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        AI Insights
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Ask a compensation question in plain English. Queries are interpreted by a
        rule-based engine (no external LLM) and translated into SQL.
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              placeholder="e.g. What is the total payroll cost in India?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && run()}
            />
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={() => run()}
              disabled={ask.isPending}
              sx={{ minWidth: 120 }}
            >
              Ask
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap", gap: 1 }}>
            {EXAMPLES.map((ex) => (
              <Chip
                key={ex}
                label={ex}
                variant="outlined"
                onClick={() => run(ex)}
                clickable
              />
            ))}
          </Stack>
        </CardContent>
      </Card>

      {ask.isError && <Alert severity="error">Failed to reach the API.</Alert>}

      {result && (
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
              Interpreted as
            </Typography>
            <Typography sx={{ mb: 2 }}>{result.interpreted}</Typography>

            <Typography variant="subtitle2" color="text.secondary">
              Generated SQL
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                mb: 2,
                bgcolor: "#0f172a",
                color: "#e2e8f0",
                fontFamily: "monospace",
                fontSize: 13,
                whiteSpace: "pre-wrap",
                borderRadius: 2,
              }}
            >
              {result.sql_explanation}
            </Paper>

            <Typography variant="subtitle2" color="text.secondary">
              Result
            </Typography>

            {result.result_type === "message" && (
              <Alert severity="info" sx={{ mt: 1, whiteSpace: "pre-line" }}>
                {result.message}
              </Alert>
            )}

            {result.result_type === "scalar" && (
              <Typography variant="h5" sx={{ mt: 1 }}>
                {result.message ?? String(result.rows?.[0]?.[0] ?? "")}
              </Typography>
            )}

            {result.result_type === "table" && (
              <Table size="small" sx={{ mt: 1 }}>
                <TableHead>
                  <TableRow>
                    {result.columns.map((c) => (
                      <TableCell key={c} sx={{ fontWeight: 700 }}>
                        {c}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.rows.map((row, i) => (
                    <TableRow key={i}>
                      {row.map((cell, j) => (
                        <TableCell key={j}>{String(cell)}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
