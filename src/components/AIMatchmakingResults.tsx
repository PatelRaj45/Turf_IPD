import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Player {
  id: string;
  name: string;
  position: string;
  skillLevel: number;
  winRate: number;
}

interface MatchQuality {
  skill_balance: number;
  synergy: number;
  availability: number;
  location: number;
  position_balance: number;
}

interface AIMatchmakingResultsProps {
  teamA: Player[];
  teamB: Player[];
  confidenceScore: number;
  matchQuality: MatchQuality;
  explanation: string;
  isLoading: boolean;
  error: string | null;
}

const AIMatchmakingResults: React.FC<AIMatchmakingResultsProps> = ({
  teamA,
  teamB,
  confidenceScore,
  matchQuality,
  explanation,
  isLoading,
  error
}) => {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sport-green-dark"></div>
            <p className="mt-4 text-gray-600">Generating optimal teams...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="bg-red-50 text-red-600 p-4 rounded-md">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Helper function to render player row
  const renderPlayer = (player: Player) => (
    <tr key={player.id} className="border-b border-gray-100 last:border-0">
      <td className="py-3 px-2">
        <div className="font-medium">{player.name}</div>
      </td>
      <td className="py-3 px-2 text-gray-600">{player.position}</td>
      <td className="py-3 px-2">
        <div className="flex items-center">
          <span className="font-medium">{player.skillLevel}/5</span>
        </div>
      </td>
      <td className="py-3 px-2">
        <Badge 
          className={`${player.winRate >= 65 ? 'bg-green-100 text-green-800' : 
                      player.winRate >= 50 ? 'bg-blue-100 text-blue-800' : 
                      'bg-orange-100 text-orange-800'}`}
        >
          {Math.round(player.winRate * 100)}%
        </Badge>
      </td>
    </tr>
  );

  return (
    <div className="w-full">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center justify-between">
            <span>AI Matchmaking Results</span>
            <Badge 
              className={`${confidenceScore >= 85 ? 'bg-green-100 text-green-800' : 
                          confidenceScore >= 70 ? 'bg-blue-100 text-blue-800' : 
                          'bg-orange-100 text-orange-800'}`}
            >
              {confidenceScore.toFixed(1)}% Confidence
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team A */}
            <div>
              <h3 className="text-lg font-bold mb-3 text-sport-green-dark">Team A</h3>
              <div className="bg-white rounded-md overflow-hidden border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="py-2 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                      <th className="py-2 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skill</th>
                      <th className="py-2 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Win Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamA.map(renderPlayer)}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Team B */}
            <div>
              <h3 className="text-lg font-bold mb-3 text-sport-green-dark">Team B</h3>
              <div className="bg-white rounded-md overflow-hidden border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="py-2 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                      <th className="py-2 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skill</th>
                      <th className="py-2 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Win Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamB.map(renderPlayer)}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Match Quality Breakdown */}
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">Match Quality Breakdown</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Skill Balance</span>
                  <span className="text-sm font-medium">{matchQuality.skill_balance.toFixed(1)}%</span>
                </div>
                <Progress value={matchQuality.skill_balance} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Team Synergy</span>
                  <span className="text-sm font-medium">{matchQuality.synergy.toFixed(1)}%</span>
                </div>
                <Progress value={matchQuality.synergy} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Availability Match</span>
                  <span className="text-sm font-medium">{matchQuality.availability.toFixed(1)}%</span>
                </div>
                <Progress value={matchQuality.availability} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Location Compatibility</span>
                  <span className="text-sm font-medium">{matchQuality.location.toFixed(1)}%</span>
                </div>
                <Progress value={matchQuality.location} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Position Balance</span>
                  <span className="text-sm font-medium">{matchQuality.position_balance.toFixed(1)}%</span>
                </div>
                <Progress value={matchQuality.position_balance} className="h-2" />
              </div>
            </div>
          </div>

          {/* Match Explanation */}
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-md font-bold mb-2">Match Explanation</h3>
            <p className="text-gray-700">{explanation}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIMatchmakingResults;