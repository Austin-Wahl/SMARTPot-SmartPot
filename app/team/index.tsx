import TeamMember from '@/components/custom/team-member';
import { ITeamMember } from '@/types';
import { Stack } from 'expo-router';
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
