import TeamMember from '@/components/custom/team-member';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ITeamMember } from '@/types';
import { router, Stack } from 'expo-router';
import { House } from 'lucide-react-native';
import React from 'react';
import { ScrollView, View } from 'react-native';
const teamMembers: Array<ITeamMember> = [
  {
    name: 'Austin Wahl',
    role: 'Software Engineer',
    picture: '',
  },
  {
    name: 'A',
    role: 'Software Engineer',
    picture: '',
  },
  {
    name: 'B',
    role: 'Software Engineer',
    picture: '',
  },
  {
    name: 'C',
    role: 'Engineer',
    picture: '',
  },
  {
    name: 'D',
    role: 'Engineer',
    picture: '',
  },
  {
    name: 'E',
    role: 'Engineer',
    picture: '',
  },
];
const Team = () => {
  return (
    <ScrollView>
      <View className="flex w-full gap-4 p-4">
        {teamMembers.map((teamMember, index) => {
          return <TeamMember teamMember={teamMember} key={index} />;
        })}
      </View>
      <Stack />
    </ScrollView>
  );
};

export default Team;
