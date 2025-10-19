import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { ITeamMember } from '@/types';
import React from 'react';
import { View } from 'react-native';

const TeamMember = ({ teamMember }: { teamMember: ITeamMember }) => {
  return (
    <View className="flex flex-row items-center gap-4 rounded-lg border-[1px] border-border p-4">
      <View>
        <Avatar alt="Team Member Picture" className="h-[60px] w-[60px]">
          <AvatarFallback>
            <Skeleton className="h-[60px] w-[60px]" />
          </AvatarFallback>
          <AvatarImage src={teamMember.picture} />
        </Avatar>
      </View>
      <View>
        <Text>{teamMember.name}</Text>
        <Text className="text-sm text-muted-foreground">{teamMember.role}</Text>
      </View>
    </View>
  );
};

export default TeamMember;
