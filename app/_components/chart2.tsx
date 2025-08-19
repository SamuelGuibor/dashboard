/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Input } from "@/app/_components/ui/input";
import { Button } from "@/app/_components/ui/button";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import { ChartConfig, ChartContainer } from "@/app/_components/ui/chart";
import { GetValue } from "@/app/_actions/get-value";
import { updateData } from "@/app/_actions/update-dash";

interface DataValue {
  id: string;
  name: string;
  value: string;
}

interface ChartRadialTextsProps {
  title: string;
  value: number;
  label: string;
  id: string;
  onEdit: (id: string, currentValue: string) => void;
  onSave: (id: string) => void;
  onCancel: () => void;
  isEditing: boolean;
  editValue: string;
  setEditValue: (value: string) => void;
}

function ChartRadialTexts({
  title,
  value,
  label,
  id,
  onEdit,
  onSave,
  onCancel,
  isEditing,
  editValue,
  setEditValue,
}: ChartRadialTextsProps) {
  const chartConfig = {
    visitors: {
      label: "Visitors",
    },
    safari: {
      label: "Safari",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  const totalMatch = label.match(/(\d+)/);
  const total = totalMatch ? parseInt(totalMatch[1], 10) : 100;
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const endAngle = -270 + (percentage / 100) * 360;
  const reachedGoal = value >= total;
  const barColor = reachedGoal ? "#22c55e" : "#ef4444";

  const chartData = [{ name: title, visitors: value, fill: barColor }];

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {isEditing ? (
          <div className="flex flex-col gap-2 items-center">
            <Input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="text-2xl w-24 text-center"
            />
            <div className="flex gap-2">
              <Button onClick={() => onSave(id)}>Salvar</Button>
              <Button variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <RadialBarChart
                data={chartData}
                startAngle={-270}
                endAngle={endAngle}
                innerRadius={80}
                outerRadius={110}
              >
                <PolarGrid
                  gridType="circle"
                  radialLines={false}
                  stroke="none"
                  className="first:fill-muted last:fill-background"
                  polarRadius={[86, 74]}
                />
                <RadialBar dataKey="visitors" background cornerRadius={10} />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-4xl font-bold"
                            >
                              {value}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              {label}
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </PolarRadiusAxis>
              </RadialBarChart>
            </ChartContainer>
            <Button
              variant="link"
              className="mt-2"
              onClick={() => onEdit(id, value.toString())}
            >
              Editar
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}